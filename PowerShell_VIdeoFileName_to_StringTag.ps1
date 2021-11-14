##�y�ݒ�֘A�z ########################################################################################################
$piDaServerNameString = "localhost" #PI-DA Server��
$piStringTagname = "Yoshi.Car.DriveRecorder.Video.FileName2" #������Tag��
$strInputFile_Path = "C:\camera\*.mp4" #Video�t�@�C���ۑ���FullPath�w��
#######################################################################################################################

Import-Module -Name OSIsoft.PowerShell
"PI PowerShell�o�[�W�����F"
(Get-Module OSIsoft.PowerShell).Version


#������^�O�擾
$con = Connect-PIDataArchive -PIDataArchiveMachineName $piDaServerNameString
$pipoint = Get-PIPoint -Name $piStringTagname -Connection $con
if ($pipoint -eq $null){
    #������΃^�O�쐬
    #210913140355 > int32.max�Ȃ̂ŁAFloat64�ɕۑ�
    Add-PIPoint -Name $piStringTagname -Attributes @{PointType = "Int32" } -Connection $con
    $pipoint = Get-PIPoint -Name $piStringTagname -Connection $con
}
$index = 1
#Video�t�@�C����Loop
foreach($fileFullPath in Get-ChildItem -File $strInputFile_Path){
    
    #�t�@�C�������o
    $fileName = [System.IO.Path]::GetFileName($fileFullPath) 

    #Timestamp����
    $dateString = [System.IO.Path]::GetFileNameWithoutExtension($fileName)     
    $date = [DateTime]::ParseExact($dateString,"yyMMddHHmmss", $null);
    Write-Host ([double]$dateString)
    WRite-Host $date
    # ������^�O�Ƀt�@�C�����f�[�^�i�[
    #Add-PIValue -PIPoint $pipoint -Time $date -Value ([double]$dateString) -WriteMode AppendX
    Add-PIValue -PIPoint $pipoint -Time $date -Value $index -WriteMode Replace

    #�f�[�^�i�[�ς݃t�@�C���͊g���q�ύX
    Rename-Item -Path $fileFullPath -NewName "$index.mp4"
    $index += 1
    #break
}
exit
