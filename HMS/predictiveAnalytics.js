// predictiveAnalytics.js - AI Predictive Logic Engine for Health Management System with Gemini Integration

const GeminiAI = require('./geminiAI');

class PredictiveAnalytics {
  constructor(userContext, apiBaseUrl = "http://127.0.0.1:5000/api") {
    this.userContext = userContext;
    this.apiBaseUrl = apiBaseUrl;
    this.healthThresholds = {
      bloodPressure: { systolic: { high: 140, critical: 180 }, diastolic: { high: 90, critical: 120 } },
      heartRate: { low: 60, high: 100, critical: 120 },
      temperature: { low: 97, high: 99, critical: 103 },
      oxygenSaturation: { low: 95, critical: 90 }
    };
    // Initialize Gemini AI
    this.geminiAI = new GeminiAI();
  }

  // Analyze user behavior patterns to predict next actions
  analyzeUserPatterns() {
    const context = this.userContext;
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();

    let predictions = {
      nextLikelyAction: null,
      confidence: 0,
      reasoning: []
    };

    // Time-based predictions
    if (currentHour >= 8 && currentHour <= 10) {
      predictions.nextLikelyAction = 'check_vitals';
      predictions.confidence = 0.7;
      predictions.reasoning.push('Morning routine - vital checks common');
    } else if (currentHour >= 12 && currentHour <= 14) {
      predictions.nextLikelyAction = 'log_symptoms';
      predictions.confidence = 0.6;
      predictions.reasoning.push('Lunch time - symptom logging common');
    } else if (currentHour >= 18 && currentHour <= 20) {
      predictions.nextLikelyAction = 'medication_check';
      predictions.confidence = 0.8;
      predictions.reasoning.push('Evening - medication administration time');
    }

    // Behavior pattern analysis
    const recentCommands = context.commandHistory.slice(-10);
    const commandFrequency = {};
    recentCommands.forEach(cmd => {
      commandFrequency[cmd.action] = (commandFrequency[cmd.action] || 0) + 1;
    });

    const mostFrequentAction = Object.keys(commandFrequency).reduce((a, b) =>
      commandFrequency[a] > commandFrequency[b] ? a : b, null);

    if (mostFrequentAction && commandFrequency[mostFrequentAction] >= 3) {
      predictions.nextLikelyAction = mostFrequentAction;
      predictions.confidence = Math.min(0.9, commandFrequency[mostFrequentAction] / 10);
      predictions.reasoning.push(`Pattern: ${mostFrequentAction} is frequently used`);
    }

    // Health state based predictions
    if (context.predictiveState.healthRiskLevel === 'high') {
      predictions.nextLikelyAction = 'emergency_check';
      predictions.confidence = 0.9;
      predictions.reasoning.push('High health risk detected');
    }

    context.predictiveState.nextLikelyAction = predictions.nextLikelyAction;
    return predictions;
  }

  // Generate time-based suggestions
  async generateTimeBasedSuggestions() {
    const context = this.userContext;
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    let suggestions = [];

    try {
      // Fetch medication schedule
      const medRes = await fetch(`${this.apiBaseUrl}/medications`);
      const medications = medRes.ok ? await medRes.json() : [];

      // Check for upcoming medications
      medications.forEach(med => {
        if (med.active && med.timing) {
          const times = med.timing.split(',');
          times.forEach(timeStr => {
            const [hours, minutes] = timeStr.trim().split(':').map(Number);
            const medTime = hours * 60 + minutes;
            const timeDiff = medTime - currentTime;

            if (timeDiff > 0 && timeDiff <= 60) { // Within next hour
              suggestions.push({
                type: 'medication_reminder',
                priority: 'high',
                message: `Time for ${med.name} ${med.dose} in ${timeDiff} minutes`,
                action: 'medications',
                data: med
              });
            }
          });
        }
      });

      // Fetch appointments
      const apptRes = await fetch(`${this.apiBaseUrl}/appointments/${context.userId || 1}`);
      const appointments = apptRes.ok ? await apptRes.json() : [];

      // Check for upcoming appointments
      appointments.forEach(appt => {
        const apptTime = new Date(appt.datetime);
        const timeDiff = (apptTime - now) / (1000 * 60); // minutes

        if (timeDiff > 0 && timeDiff <= 120) { // Within next 2 hours
          suggestions.push({
            type: 'appointment_reminder',
            priority: 'high',
            message: `Appointment with ${appt.doctor} in ${Math.round(timeDiff)} minutes`,
            action: 'appts',
            data: appt
          });
        }
      });

      // Daily routine suggestions
      const hour = now.getHours();
      if (hour >= 8 && hour <= 9 && !this.hasRecentVitalCheck(context, 1440)) { // No vitals in last 24h
        suggestions.push({
          type: 'routine_check',
          priority: 'medium',
          message: 'Good morning! Consider checking your vitals',
          action: 'vitals'
        });
      }

      if (hour >= 18 && hour <= 20) {
        suggestions.push({
          type: 'evening_check',
          priority: 'medium',
          message: 'Evening check: Any symptoms to log?',
          action: 'symptoms'
        });
      }

    } catch (error) {
      console.error('Error generating time-based suggestions:', error);
    }

    context.timeBasedSuggestions = suggestions;
    return suggestions;
  }

  // Analyze health trends and detect anomalies
  async analyzeHealthTrends() {
    const context = this.userContext;

    try {
      // Fetch recent vitals
      const vitalRes = await fetch(`${this.apiBaseUrl}/vitals/${context.userId || 1}`);
      const vitals = vitalRes.ok ? await vitalRes.json() : [];

      // Fetch recent symptoms
      const symptomRes = await fetch(`${this.apiBaseUrl}/symptoms/${context.userId || 1}`);
      const symptoms = symptomRes.ok ? await symptomRes.json() : [];

      let trends = {
        vitalTrends: {},
        symptomPatterns: [],
        riskLevel: 'low',
        alerts: []
      };

      // Analyze vital signs trends
      const vitalGroups = {};
      vitals.forEach(vital => {
        if (!vitalGroups[vital.type]) vitalGroups[vital.type] = [];
        vitalGroups[vital.type].push(vital);
      });

      Object.keys(vitalGroups).forEach(type => {
        const readings = vitalGroups[type].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        if (readings.length >= 3) {
          const recent = readings.slice(-3);
          const trend = this.calculateTrend(recent.map(r => parseFloat(r.value)));

          trends.vitalTrends[type] = {
            trend: trend,
            latest: recent[recent.length - 1],
            average: recent.reduce((sum, r) => sum + parseFloat(r.value), 0) / recent.length
          };

          // Check for anomalies
          const anomaly = this.detectVitalAnomaly(type, recent[recent.length - 1]);
          if (anomaly) {
            trends.alerts.push({
              type: 'vital_anomaly',
              severity: anomaly.severity,
              message: anomaly.message,
              data: recent[recent.length - 1]
            });
            if (anomaly.severity === 'critical') trends.riskLevel = 'high';
            else if (anomaly.severity === 'high' && trends.riskLevel !== 'high') trends.riskLevel = 'medium';
          }
        }
      });

      // Analyze symptom patterns
      const symptomGroups = {};
      symptoms.forEach(symptom => {
        if (!symptomGroups[symptom.name]) symptomGroups[symptom.name] = [];
        symptomGroups[symptom.name].push(symptom);
      });

      Object.keys(symptomGroups).forEach(name => {
        const occurrences = symptomGroups[name];
        if (occurrences.length >= 3) {
          const recentOccurrences = occurrences.filter(s =>
            (new Date() - new Date(s.timestamp)) / (1000 * 60 * 60 * 24) <= 7 // Last 7 days
          );

          if (recentOccurrences.length >= 3) {
            trends.symptomPatterns.push({
              symptom: name,
              frequency: recentOccurrences.length,
              averageSeverity: recentOccurrences.reduce((sum, s) => sum + s.severity, 0) / recentOccurrences.length,
              trend: 'increasing'
            });

            trends.alerts.push({
              type: 'symptom_pattern',
              severity: 'medium',
              message: `Frequent ${name} reported (${recentOccurrences.length} times in last week)`,
              data: { symptom: name, occurrences: recentOccurrences.length }
            });
          }
        }
      });

      context.predictiveState.healthRiskLevel = trends.riskLevel;
      context.realTimeHealth.trendingIssues = trends.symptomPatterns;
      context.realTimeHealth.currentAlerts = trends.alerts;

      return trends;

    } catch (error) {
      console.error('Error analyzing health trends:', error);
      return { vitalTrends: {}, symptomPatterns: [], riskLevel: 'unknown', alerts: [] };
    }
  }

  // Generate proactive alerts
  generateProactiveAlerts() {
    const context = this.userContext;
    let alerts = [];

    // Medication compliance alerts
    if (context.predictiveState.medicationCompliance < 0.8) {
      alerts.push({
        type: 'compliance',
        priority: 'high',
        message: 'Medication compliance is low. Please review your medication schedule.',
        action: 'medications'
      });
    }

    // Appointment adherence alerts
    if (context.predictiveState.appointmentAdherence < 0.9) {
      alerts.push({
        type: 'adherence',
        priority: 'medium',
        message: 'You have missed recent appointments. Consider rescheduling.',
        action: 'appts'
      });
    }

    // Health risk alerts
    if (context.predictiveState.healthRiskLevel === 'high') {
      alerts.push({
        type: 'health_risk',
        priority: 'critical',
        message: 'Critical health indicators detected. Please consult healthcare provider immediately.',
        action: 'emergency'
      });
    }

    // Proactive suggestions based on patterns
    if (context.userBehavior.commonActions.length > 0) {
      const suggestedAction = context.userBehavior.commonActions[0];
      alerts.push({
        type: 'suggestion',
        priority: 'low',
        message: `Based on your patterns, you might want to ${suggestedAction.replace('_', ' ')} now.`,
        action: suggestedAction
      });
    }

    context.realTimeHealth.preventiveMeasures = alerts.filter(a => a.type === 'suggestion');
    return alerts;
  }

  // Helper methods
  calculateTrend(values) {
    if (values.length < 2) return 'stable';
    const diffs = [];
    for (let i = 1; i < values.length; i++) {
      diffs.push(values[i] - values[i - 1]);
    }
    const avgDiff = diffs.reduce((sum, diff) => sum + diff, 0) / diffs.length;
    if (avgDiff > 1) return 'increasing';
    if (avgDiff < -1) return 'decreasing';
    return 'stable';
  }

  detectVitalAnomaly(type, reading) {
    const value = parseFloat(reading.value);
    const thresholds = this.healthThresholds;

    switch (type.toLowerCase()) {
      case 'blood pressure':
        const [systolic, diastolic] = reading.value.split('/').map(v => parseFloat(v.trim()));
        if (systolic >= thresholds.bloodPressure.systolic.critical || diastolic >= thresholds.bloodPressure.diastolic.critical) {
          return { severity: 'critical', message: `Critical blood pressure: ${reading.value}` };
        } else if (systolic >= thresholds.bloodPressure.systolic.high || diastolic >= thresholds.bloodPressure.diastolic.high) {
          return { severity: 'high', message: `High blood pressure: ${reading.value}` };
        }
        break;

      case 'heart rate':
        if (value >= thresholds.heartRate.critical) {
          return { severity: 'critical', message: `Critical heart rate: ${value} bpm` };
        } else if (value >= thresholds.heartRate.high || value <= thresholds.heartRate.low) {
          return { severity: 'medium', message: `Abnormal heart rate: ${value} bpm` };
        }
        break;

      case 'temperature':
        if (value >= thresholds.temperature.critical) {
          return { severity: 'critical', message: `Critical temperature: ${value}°F` };
        } else if (value >= thresholds.temperature.high || value <= thresholds.temperature.low) {
          return { severity: 'medium', message: `Abnormal temperature: ${value}°F` };
        }
        break;

      case 'oxygen saturation':
        if (value <= thresholds.oxygenSaturation.critical) {
          return { severity: 'critical', message: `Critical oxygen saturation: ${value}%` };
        } else if (value <= thresholds.oxygenSaturation.low) {
          return { severity: 'high', message: `Low oxygen saturation: ${value}%` };
        }
        break;
    }

    return null;
  }

  hasRecentVitalCheck(context, minutesThreshold) {
    // Check if user has checked vitals recently
    const lastCheck = context.realTimeHealth.lastVitalCheck;
    if (!lastCheck) return false;

    const timeDiff = (new Date() - new Date(lastCheck)) / (1000 * 60);
    return timeDiff <= minutesThreshold;
  }

  // Update user context with new command
  updateContextWithCommand(command, action) {
    const context = this.userContext;

    // Add to command history
    context.commandHistory.push({
      command: command,
      action: action,
      timestamp: new Date(),
      page: context.lastPage
    });

    // Keep only last 50 commands
    if (context.commandHistory.length > 50) {
      context.commandHistory = context.commandHistory.slice(-50);
    }

    // Update behavior patterns
    context.userBehavior.commonActions = this.getMostCommonActions(context.commandHistory);

    // Update session analytics
    context.sessionAnalytics.commandsProcessed++;
    if (action !== 'unknown') {
      context.sessionAnalytics.successfulCommands++;
    }

    context.lastAction = action;
  }

  getMostCommonActions(history) {
    const actionCount = {};
    history.forEach(item => {
      actionCount[item.action] = (actionCount[item.action] || 0) + 1;
    });

    return Object.keys(actionCount)
      .sort((a, b) => actionCount[b] - actionCount[a])
      .slice(0, 5);
  }

  // Generate personalized health report
  async generatePersonalizedHealthReport(userId) {
    try {
      const report = {
        userId: userId,
        generatedAt: new Date().toISOString(),
        vitalsSummary: {},
        symptomsSummary: {},
        medicationsSummary: {},
        predictiveInsights: []
      };

      // Fetch recent vitals (last 30 days)
      const vitalRes = await fetch(`${this.apiBaseUrl}/vitals/${userId}`);
      const vitals = vitalRes.ok ? await vitalRes.json() : [];
      const recentVitals = vitals.filter(v => (new Date() - new Date(v.timestamp)) / (1000 * 60 * 60 * 24) <= 30);

      // Summarize vitals
      const vitalGroups = {};
      recentVitals.forEach(vital => {
        if (!vitalGroups[vital.type]) vitalGroups[vital.type] = [];
        vitalGroups[vital.type].push(vital);
      });

      Object.keys(vitalGroups).forEach(type => {
        const readings = vitalGroups[type].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        const values = readings.map(r => parseFloat(r.value));
        const average = values.reduce((sum, val) => sum + val, 0) / values.length;
        const trend = this.calculateTrend(values);
        const latest = readings[readings.length - 1];
        const anomaly = this.detectVitalAnomaly(type, latest);

        report.vitalsSummary[type] = {
          average: average.toFixed(2),
          trend: trend,
          latestValue: latest.value,
          latestTimestamp: latest.timestamp,
          anomaly: anomaly ? anomaly.message : null,
          readingsCount: readings.length
        };
      });

      // Fetch recent symptoms (last 30 days)
      const symptomRes = await fetch(`${this.apiBaseUrl}/symptoms/${userId}`);
      const symptoms = symptomRes.ok ? await symptomRes.json() : [];
      const recentSymptoms = symptoms.filter(s => (new Date() - new Date(s.timestamp)) / (1000 * 60 * 60 * 24) <= 30);

      // Summarize symptoms
      const symptomGroups = {};
      recentSymptoms.forEach(symptom => {
        if (!symptomGroups[symptom.name]) symptomGroups[symptom.name] = [];
        symptomGroups[symptom.name].push(symptom);
      });

      Object.keys(symptomGroups).forEach(name => {
        const occurrences = symptomGroups[name];
        const frequency = occurrences.length;
        const averageSeverity = occurrences.reduce((sum, s) => sum + s.severity, 0) / frequency;
        const recentOccurrences = occurrences.filter(s =>
          (new Date() - new Date(s.timestamp)) / (1000 * 60 * 60 * 24) <= 7
        );

        report.symptomsSummary[name] = {
          frequency: frequency,
          averageSeverity: averageSeverity.toFixed(1),
          recentFrequency: recentOccurrences.length,
          trend: recentOccurrences.length >= 3 ? 'increasing' : 'stable'
        };
      });

      // Fetch medications
      const medRes = await fetch(`${this.apiBaseUrl}/medications`);
      const medications = medRes.ok ? await medRes.json() : [];
      const userMedications = medications.filter(m => m.patientId === userId && m.active);

      // Summarize medications
      report.medicationsSummary = {
        activeCount: userMedications.length,
        medications: userMedications.map(med => ({
          name: med.name,
          dose: med.dose,
          timing: med.timing,
          purpose: med.purpose || 'Not specified'
        }))
      };

      // Generate predictive insights
      let trends = { riskLevel: 'low', vitalTrends: {}, symptomPatterns: [] };
      try {
        // Create a temporary context for trend analysis
        const tempContext = {
          userId: userId,
          predictiveState: {},
          realTimeHealth: {}
        };
        const tempPA = new PredictiveAnalytics(tempContext, this.apiBaseUrl);
        trends = await tempPA.analyzeHealthTrends();
      } catch (error) {
        console.warn('Could not analyze health trends:', error.message);
      }

      report.predictiveInsights = [
        {
          type: 'health_risk',
          level: trends.riskLevel,
          message: `Current health risk level: ${trends.riskLevel}`
        },
        {
          type: 'vital_trends',
          message: Object.keys(trends.vitalTrends).length > 0 ?
            `Vital trends: ${Object.entries(trends.vitalTrends).map(([type, data]) => `${type} is ${data.trend}`).join(', ')}` :
            'No significant vital trends detected'
        },
        {
          type: 'symptom_patterns',
          message: trends.symptomPatterns.length > 0 ?
            `Symptom patterns: ${trends.symptomPatterns.map(p => `${p.symptom} (${p.frequency} occurrences)`).join(', ')}` :
            'No concerning symptom patterns'
        }
      ];

      // Use GeminiAI for personalized recommendations
      if (this.geminiAI && this.geminiAI.generateHealthRecommendations) {
        try {
          const patientData = { age: 'unknown', gender: 'unknown', chronicConditions: 'none reported' };
          const vitalsArray = Object.entries(report.vitalsSummary).map(([type, data]) => ({
            type,
            value: data.latestValue,
            unit: '',
            timestamp: data.latestTimestamp
          }));
          const aiResponse = await this.geminiAI.generateHealthRecommendations(patientData, vitalsArray, report.medicationsSummary.medications);
          if (aiResponse && aiResponse.success) {
            report.predictiveInsights.push({
              type: 'ai_recommendations',
              message: `Lifestyle: ${aiResponse.recommendations.lifestyle.join(', ')}. Medication tips: ${aiResponse.recommendations.medicationTips.join(', ')}. Preventive care: ${aiResponse.recommendations.preventiveCare.join(', ')}`
            });
          }
        } catch (error) {
          console.warn('Could not generate AI recommendations:', error.message);
        }
      }

      return report;

    } catch (error) {
      console.error('Error generating personalized health report:', error);
      return {
        userId: userId,
        generatedAt: new Date().toISOString(),
        error: 'Failed to generate report',
        details: error.message
      };
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PredictiveAnalytics;
}
