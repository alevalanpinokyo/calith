@echo off
echo =======================================
echo CALITH OTOMATIK PUSH SISTEMI
echo =======================================
echo.

set /p commit_msg="Commit mesajini girin (Bos birakirsaniz 'Guncelleme' yazilacak): "
if "%commit_msg%"=="" set commit_msg=Guncelleme

echo.
echo [1/3] Versiyon guncelleniyor (update_version.py calistiriliyor)...
python update_version.py

echo.
echo [2/3] Dosyalar hazirlaniyor ve commitleniyor...
git add .
git commit -m "%commit_msg%"

echo.
echo [3/3] GitHub'a yukleniyor (Pushing)...
git push

echo.
echo =======================================
echo ISLEM BASARIYLA TAMAMLANDI!
echo =======================================
pause
