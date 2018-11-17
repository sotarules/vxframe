@echo off
c:
cd c:\git\vxframe
SET ROOT_URL=http://sota.ddns.net
SET NO_BATCH=no
SET MAIL_GUN_TEST=yes
SET MONGO_URL=mongodb://localhost:27017/vxframe
REM SET METEOR_OFFLINE_CATALOG=1
SET METEOR_PROFILE=1000
meteor %1 --port 80