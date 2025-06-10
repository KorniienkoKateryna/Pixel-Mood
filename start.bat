@echo off


echo Запуск бекенду...
start cmd /k " npm start"

timeout /t 2 > nul

echo Запуск фронтенду...
start cmd /k "cd app && npm start"

