@echo off
title ROBLOX AI BUILDER PRO v1.0
color 0A
mode 110,40

set PROJECT=Roblox_AI_Project

:START
cls
echo.
echo ==============================================================
echo                 ROBLOX AI BUILDER PRO
echo              LUA ^| GUI ^| SYSTEM GENERATOR
echo ==============================================================
echo.
echo Projeto atual: %PROJECT%
echo.
echo [1] Criar estrutura Roblox
echo [2] Criar GUI personalizada
echo [3] Criar Sistema Hospitalar
echo [4] Criar Sistema Loja
echo [5] Criar Sistema Inventario
echo [6] Criar Sistema XP e Level
echo [7] Criar NPC
echo [8] Criar DataStore
echo [9] Criar Leaderstats
echo [10] Criar README do projeto
echo [11] Abrir pasta
echo [0] Sair
echo.

set /p menu=Escolha:

if "%menu%"=="1" goto STRUCT
if "%menu%"=="2" goto GUI
if "%menu%"=="3" goto HOSPITAL
if "%menu%"=="4" goto LOJA
if "%menu%"=="5" goto INVENTARIO
if "%menu%"=="6" goto XP
if "%menu%"=="7" goto NPC
if "%menu%"=="8" goto DATASTORE
if "%menu%"=="9" goto LEADER
if "%menu%"=="10" goto README
if "%menu%"=="11" start %PROJECT%
if "%menu%"=="0" exit

goto START


:STRUCT
mkdir %PROJECT%
mkdir %PROJECT%\ServerScriptService
mkdir %PROJECT%\StarterGui
mkdir %PROJECT%\StarterPlayerScripts
mkdir %PROJECT%\ReplicatedStorage
mkdir %PROJECT%\Workspace
mkdir %PROJECT%\Models

echo Estrutura criada!
pause
goto START



:GUI
call :folders

set /p nome=Nome da GUI:
set /p botao=Nome do botao:

(
echo -- GUI GERADA PELO ROBLOX AI BUILDER
echo -- Colocar em StarterGui
echo.
echo local ScreenGui=Instance.new("ScreenGui")
echo ScreenGui.Name="%nome%"
echo ScreenGui.Parent=game.Players.LocalPlayer.PlayerGui
echo.
echo local Button=Instance.new("TextButton")
echo Button.Parent=ScreenGui
echo Button.Text="%botao%"
echo Button.Size=UDim2.new(0,200,0,50)
)>%PROJECT%\StarterGui\%nome%.lua

echo GUI criada!
pause
goto START



:HOSPITAL
call :folders

(
echo -- SISTEMA HOSPITAL
echo -- Local: ServerScriptService
echo.
echo local Hospital={}
echo.
echo function Hospital.Heal(player)
echo player.Character.Humanoid.Health=100
echo end
echo.
echo return Hospital
)>%PROJECT%\ServerScriptService\Hospital.lua


echo Hospital criado!
pause
goto START



:LOJA
call :folders

(
echo -- SISTEMA LOJA
echo -- Local: ServerScriptService
echo.
echo local Loja={}
echo.
echo function Comprar(item)
echo print("Comprando "..item)
echo end
)>%PROJECT%\ServerScriptService\Loja.lua

echo Loja criada!
pause
goto START



:INVENTARIO
call :folders

(
echo -- SISTEMA INVENTARIO
echo -- Local: ServerScriptService
echo.
echo local Inventario={}
echo.
echo function Add(item)
echo print(item)
echo end
)>%PROJECT%\ServerScriptService\Inventario.lua

echo Inventario criado!
pause
goto START



:XP
call :folders

(
echo -- SISTEMA XP LEVEL
echo -- Local: ServerScriptService
echo.
echo local XP=0
echo.
echo function AddXP(valor)
echo XP=XP+valor
echo end
)>%PROJECT%\ServerScriptService\XP.lua

echo XP criado!
pause
goto START



:NPC
call :folders

(
echo -- NPC TEMPLATE
echo -- Local: Workspace
echo.
echo local npc=Instance.new("Model")
echo npc.Name="NPC"
)>%PROJECT%\Workspace\NPC.lua

echo NPC criado!
pause
goto START



:DATASTORE
call :folders

(
echo -- DATASTORE SYSTEM
echo -- Local: ServerScriptService
echo.
echo local DataStoreService=game:GetService("DataStoreService")
echo local Save=DataStoreService:GetDataStore("PlayerData")
)>%PROJECT%\ServerScriptService\DataStore.lua

echo DataStore criado!
pause
goto START



:LEADER
call :folders

(
echo -- LEADERSTATS
echo -- Local: ServerScriptService
echo.
echo game.Players.PlayerAdded:Connect(function(player)
echo local stats=Instance.new("Folder")
echo stats.Name="leaderstats"
echo stats.Parent=player
echo end)
)>%PROJECT%\ServerScriptService\Leaderstats.lua

echo Leaderstats criado!
pause
goto START



:README
call :folders

(
echo ROBLOX AI BUILDER PRO
echo.
echo ONDE COLOCAR OS SCRIPTS:
echo.
echo ServerScriptService:
echo Sistemas do servidor.
echo.
echo StarterGui:
echo Interfaces.
echo.
echo StarterPlayerScripts:
echo Scripts do jogador.
echo.
echo ReplicatedStorage:
echo Eventos e dados compartilhados.
echo.
echo Workspace:
echo Objetos e NPCs.
)>%PROJECT%\README.txt

echo README criado!
pause
goto START



:folders
mkdir %PROJECT% 2>nul
mkdir %PROJECT%\ServerScriptService 2>nul
mkdir %PROJECT%\StarterGui 2>nul
mkdir %PROJECT%\StarterPlayerScripts 2>nul
mkdir %PROJECT%\ReplicatedStorage 2>nul
mkdir %PROJECT%\Workspace 2>nul
exit /bMete