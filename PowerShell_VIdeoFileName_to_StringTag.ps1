##【設定関連】 ########################################################################################################
$piDaServerNameString = "localhost" #PI-DA Server名
$piStringTagname = "Yoshi.Car.DriveRecorder.Video.FileName2" #文字列Tag名
$strInputFile_Path = "C:\camera\*.mp4" #Videoファイル保存先FullPath指定
#######################################################################################################################

Import-Module -Name OSIsoft.PowerShell
"PI PowerShellバージョン："
(Get-Module OSIsoft.PowerShell).Version


#文字列タグ取得
$con = Connect-PIDataArchive -PIDataArchiveMachineName $piDaServerNameString
$pipoint = Get-PIPoint -Name $piStringTagname -Connection $con
if ($pipoint -eq $null){
    #無ければタグ作成
    #210913140355 > int32.maxなので、Float64に保存
    Add-PIPoint -Name $piStringTagname -Attributes @{PointType = "Int32" } -Connection $con
    $pipoint = Get-PIPoint -Name $piStringTagname -Connection $con
}
$index = 1
#Videoファイル毎Loop
foreach($fileFullPath in Get-ChildItem -File $strInputFile_Path){
    
    #ファイル名抽出
    $fileName = [System.IO.Path]::GetFileName($fileFullPath) 

    #Timestamp生成
    $dateString = [System.IO.Path]::GetFileNameWithoutExtension($fileName)     
    $date = [DateTime]::ParseExact($dateString,"yyMMddHHmmss", $null);
    Write-Host ([double]$dateString)
    WRite-Host $date
    # 文字列タグにファイル名データ格納
    #Add-PIValue -PIPoint $pipoint -Time $date -Value ([double]$dateString) -WriteMode AppendX
    Add-PIValue -PIPoint $pipoint -Time $date -Value $index -WriteMode Replace

    #データ格納済みファイルは拡張子変更
    Rename-Item -Path $fileFullPath -NewName "$index.mp4"
    $index += 1
    #break
}
exit
