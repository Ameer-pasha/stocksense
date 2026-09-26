@echo off
echo ======================================================================
echo  StockSense - Enterprise Desktop Inventory Management System
echo  Member 4 Focus: Dashboard, Analytics, Alerts & Intelligence
echo ======================================================================
echo.
echo Starting local web server on port 8000...
start http://localhost:8000
python server.py
pause
