/* backend/cmodules/healthcalc.c */
 #include <Python.h>
 /* healthcalc.calc_bmi(weight, height_m) -> bmi */
 static PyObject* calc_bmi(PyObject* self, PyObject* args) {
    double weight, height;
    if (!PyArg_ParseTuple(args, "dd", &weight, &height)) {
        return NULL;
    }
    if (height <= 0) {
        PyErr_SetString(PyExc_ValueError, "height must be > 0");
        return NULL;
    }
    double bmi = weight / (height * height);
    return Py_BuildValue("d", bmi);
 }
 static PyMethodDef HealthCalcMethods[] = {
    {"calc_bmi", calc_bmi, METH_VARARGS, "Calculate BMI from weight(kg) and height(m)."},
    {NULL, NULL, 0, NULL}
 };
 static struct PyModuleDef healthcalcmodule = {
    PyModuleDef_HEAD_INIT,
    "healthcalc",
    "Health calculation helpers",
    -1,
    HealthCalcMethods
 };
 PyMODINIT_FUNC PyInit_healthcalc(void) {
    return PyModule_Create(&healthcalcmodule);
 }
