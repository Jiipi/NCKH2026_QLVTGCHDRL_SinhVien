@echo off
echo Compacting Docker VHDX...
echo.
diskpart /s compact-disk.txt
echo.
echo Done! Check the output above.
pause
