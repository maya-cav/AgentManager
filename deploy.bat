@echo off

echo Build Angular project for test environment...
call ng b --base-href /agentManager/ --configuration=test

echo Deploying to tenne server...
scp -r C:\Users\maya\Desktop\agentManager\dist\agentManager\browser\* cav@tenne:/cav/zj/agentManager/

echo Setting permissions on server...
ssh cav@tenne "chmod -R a+rx /cav/zj/agentManager/"

echo Deployment complete!