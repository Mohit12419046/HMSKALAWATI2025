# backend/cmodules/setup.py
from setuptools import setup, Extension
module = Extension('healthcalc', sources=['healthcalc.c'])
setup(
    name='healthcalc',
    version='0.1',
    ext_modules=[module]
)
