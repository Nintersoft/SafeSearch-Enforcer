@echo off
rmdir /s /q ..\output
mkdir ..\output
web-ext -s ..\Firefox\ -a ..\output\ -v build