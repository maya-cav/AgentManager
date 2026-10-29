# AgentManager - שחרור הזמנות חסומות

אפליקציית Web (Angular 19) לשחרור הזמנות חסומות מהמחשב או מהנייד. צד השרת נמצא ב-[server/](server/).

## פיתוח

```
npm install
npm start          # ng serve עם proxy ל-/msf
```

## build והתקנה אצל לקוח

```
npm run build:shokha                                           # שוקחה
ng build --configuration production --base-href /<app>/AgentManager/   # לקוח אחר
```

את תוכן `dist/agentManager/browser` מעתיקים לשרת הלקוח. את ההגדרות של כל לקוח עורכים ב-`config.json` שבתיקייה, בלי build מחדש:

```json
{ "namespace": "SVK", "defaultCompany": "100", "customerName": "" }
```

הגישה אצל הלקוח צריכה להיות ב-HTTPS בלבד.
