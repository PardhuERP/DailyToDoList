/* ======================================
   LIFE TRACKER PRO
   APP.JS - PART 1
   CONFIG + TASKS + EXPENSES
   ====================================== */

/* ==========================
   CONFIG
========================== */

const CONFIG = {

API_URL:
"https://script.google.com/macros/s/AKfycbxXXBfs-j4AsexBRWnMb8-5RK96bB4LPPSUF8mI0j449K2aXGxiD4fO17CWCi_xwFwD/exec",

AUTO_FAIL_INTERVAL: 60000,

STORAGE_KEYS: {

TASKS: "ltp_tasks",

EXPENSES: "ltp_expenses"

}

};

/* ==========================
   GLOBAL DATA
========================== */

let tasks = [];
let expenses = [];

/* ==========================
   DOM
========================== */

const taskForm =
document.getElementById("taskForm");

const expenseForm =
document.getElementById("expenseForm");

const taskContainer =
document.getElementById("taskContainer");

/* ==========================
   INIT
========================== */

document.addEventListener(
"DOMContentLoaded",
initApp
);

function initApp(){

loadLocalData();

renderTasks();

updateDashboard();

autoFailTasks();

setInterval(
autoFailTasks,
CONFIG.AUTO_FAIL_INTERVAL
);

}

/* ==========================
   STORAGE
========================== */

function saveLocalData(){

localStorage.setItem(

CONFIG.STORAGE_KEYS.TASKS,

JSON.stringify(tasks)

);

localStorage.setItem(

CONFIG.STORAGE_KEYS.EXPENSES,

JSON.stringify(expenses)

);

}

function loadLocalData(){

tasks =
JSON.parse(

localStorage.getItem(
CONFIG.STORAGE_KEYS.TASKS
)

) || [];

expenses =
JSON.parse(

localStorage.getItem(
CONFIG.STORAGE_KEYS.EXPENSES
)

) || [];

}

/* ==========================
   ID GENERATOR
========================== */

function generateId(){

return (

Date.now().toString() +

Math.floor(
Math.random()*1000
)

);

}

/* ==========================
   TASK ADD
========================== */

taskForm.addEventListener(
"submit",
function(e){

e.preventDefault();

const task = {

id: generateId(),

taskName:
document.getElementById(
"taskName"
).value,

description:
document.getElementById(
"taskDescription"
).value,

category:
document.getElementById(
"taskCategory"
).value,

taskDate:
document.getElementById(
"taskDate"
).value,

dueTime:
document.getElementById(
"taskTime"
).value,

status: "Pending",

createdAt:
new Date().toISOString(),

updatedAt:
new Date().toISOString()

};

tasks.push(task);

saveLocalData();

renderTasks();

updateDashboard();

showToast(
"Task Added Successfully"
);

taskForm.reset();

});

/* ==========================
   EXPENSE ADD
========================== */

expenseForm.addEventListener(
"submit",
function(e){

e.preventDefault();

const expense = {

id: generateId(),

date:
document.getElementById(
"expenseDate"
).value,

purpose:
document.getElementById(
"expensePurpose"
).value,

amount:
Number(
document.getElementById(
"expenseAmount"
).value
),

category:
document.getElementById(
"expenseCategory"
).value,

notes:
document.getElementById(
"expenseNotes"
).value,

createdAt:
new Date().toISOString()

};

expenses.push(expense);

saveLocalData();

updateDashboard();

showToast(
"Expense Added Successfully"
);

expenseForm.reset();

});

/* ==========================
   TASK RENDER
========================== */

function renderTasks(){

taskContainer.innerHTML = "";

if(tasks.length === 0){

taskContainer.innerHTML =

"<p>No Tasks Available</p>";

return;

}

tasks
.sort(
(a,b)=>
new Date(b.createdAt)
-
new Date(a.createdAt)
)

.forEach(task=>{

const card =
document.createElement("div");

card.className =
"task-card";

card.innerHTML =

`
<div class="task-title">

${task.taskName}

</div>

<div class="task-desc">

${task.description || ""}

</div>

<div class="task-meta">

<span>

📅 ${task.taskDate}

</span>

<span>

⏰ ${task.dueTime}

</span>

<span>

📂 ${task.category}

</span>

<span class="badge ${(task.status || "Pending").toLowerCase()}">

${task.status || "Pending"}

</span>

</div>

<div class="task-actions">

<button
class="btn-pass"
onclick="markPassed('${task.id}')">

Pass

</button>

<button
class="btn-fail"
onclick="markFailed('${task.id}')">

Fail

</button>

<button
class="btn-edit"
onclick="editTask('${task.id}')">

Edit

</button>

<button
class="btn-delete"
onclick="deleteTask('${task.id}')">

Delete

</button>

</div>
`;

taskContainer.appendChild(card);

});

}

/* ==========================
   PASS
========================== */

function markPassed(id){

const task =
tasks.find(
t=>t.id===id
);

if(!task) return;

task.status = "Passed";

task.updatedAt =
new Date().toISOString();

saveLocalData();

renderTasks();

updateDashboard();

showToast(
"Task Completed"
);

}

/* ==========================
   FAIL
========================== */

function markFailed(id){

const task =
tasks.find(
t=>t.id===id
);

if(!task) return;

task.status = "Failed";

task.updatedAt =
new Date().toISOString();

saveLocalData();

renderTasks();

updateDashboard();

showToast(
"Task Failed"
);

}

/* ==========================
   DELETE
========================== */

function deleteTask(id){

if(
!confirm(
"Delete this task?"
)
)
return;

tasks =
tasks.filter(
t=>t.id!==id
);

saveLocalData();

renderTasks();

updateDashboard();

showToast(
"Task Deleted"
);

}

/* ==========================
   EDIT
========================== */

function editTask(id){

const task =
tasks.find(
t=>t.id===id
);

if(!task) return;

const newName =
prompt(
"Task Name",
task.taskName
);

if(!newName) return;

task.taskName =
newName;

task.updatedAt =
new Date().toISOString();

saveLocalData();

renderTasks();

updateDashboard();

showToast(
"Task Updated"
);

}

/* ==========================
   AUTO FAIL
========================== */

function autoFailTasks(){

const now =
new Date();

let changed = false;

tasks.forEach(task=>{

if(
task.status ===
"Pending"
){

const dueDateTime =
new Date(
task.taskDate +
"T" +
task.dueTime
);

if(
now > dueDateTime
){

task.status =
"Failed";

changed = true;

}

}

});

if(changed){

saveLocalData();

renderTasks();

updateDashboard();

showToast(
"Expired Tasks Failed"
);

}

}

/* ==========================
   DASHBOARD
========================== */

function updateDashboard(){

const today =
new Date()
.toISOString()
.split("T")[0];

const todayTasks =
tasks.filter(
t=>t.taskDate===today
);

const pending =
tasks.filter(
t=>t.status==="Pending"
).length;

const passed =
tasks.filter(
t=>t.status==="Passed"
).length;

const failed =
tasks.filter(
t=>t.status==="Failed"
).length;

/* Today Expense */

const todayExpense =
expenses
.filter(
e=>e.date===today
)
.reduce(
(sum,e)=>
sum + Number(e.amount),
0
);

/* Cards */

setText(
"todayTasks",
todayTasks.length
);

setText(
"pendingTasks",
pending
);

setText(
"completedTasks",
passed
);

setText(
"failedTasks",
failed
);

setText(
"todayExpense",
"₹" + todayExpense
);

/* Productivity */

updateProductivity();

}

/* ==========================
   PRODUCTIVITY
========================== */

function updateProductivity(){

const today =
new Date()
.toISOString()
.split("T")[0];

const todayTasks =
tasks.filter(
t=>t.taskDate===today
);

const completed =
todayTasks.filter(
t=>t.status==="Passed"
).length;

let percent = 0;

if(todayTasks.length>0){

percent =
Math.round(

(completed /
todayTasks.length)

*100

);

}

const ring =
document.getElementById(
"progressRing"
);

const circumference =
440;

const offset =

circumference -

(percent/100)
*
circumference;

if(ring){

ring.style.strokeDashoffset =
offset;

}

setText(
"productivityPercent",
percent + "%"
);

const msg =
document.getElementById(
"motivationText"
);

if(percent<=25){

msg.innerText =
"Let's start strong 💪";

}
else if(percent<=50){

msg.innerText =
"Good progress 🚀";

}
else if(percent<=75){

msg.innerText =
"Awesome work 🔥";

}
else{

msg.innerText =
"Excellent productivity today 👑";

}

}

/* ==========================
   HELPERS
========================== */

function setText(id,value){

const el =
document.getElementById(id);

if(el){

el.innerText =
value;

}

}

function showToast(message){

const container =
document.getElementById(
"toastContainer"
);

if(!container) return;

const toast =
document.createElement(
"div"
);

toast.className =
"toast";

toast.innerText =
message;

container.appendChild(
toast
);

setTimeout(()=>{

toast.remove();

},3000);

}

/* ======================================
   LIFE TRACKER PRO
   APP.JS - PART 2
   FILTERS + SEARCH + THEME
   ====================================== */

/* ==========================
   DOM FILTERS
========================== */

const filterStatus =
document.getElementById(
"filterStatus"
);

const filterPeriod =
document.getElementById(
"filterPeriod"
);

const taskSearch =
document.getElementById(
"taskSearch"
);

const themeBtn =
document.getElementById(
"themeBtn"
);

/* ==========================
   FILTER EVENTS
========================== */

if(filterStatus){

filterStatus.addEventListener(
"change",
applyFilters
);

}

if(filterPeriod){

filterPeriod.addEventListener(
"change",
applyFilters
);

}

if(taskSearch){

taskSearch.addEventListener(
"input",
applyFilters
);

}

/* ==========================
   FILTER ENGINE
========================== */

function applyFilters(){

let filtered =
[...tasks];

/* SEARCH */

const keyword =
taskSearch.value
.toLowerCase()
.trim();

if(keyword){

filtered =
filtered.filter(task=>{

return (

task.taskName
.toLowerCase()
.includes(keyword)

||

(task.description||"")
.toLowerCase()
.includes(keyword)

);

});

}

/* STATUS */

const status =
filterStatus.value;

if(status){

filtered =
filtered.filter(task=>

task.status === status

);

}

/* PERIOD */

const period =
filterPeriod.value;

if(period){

filtered =
filterByPeriod(
filtered,
period
);

}

renderFilteredTasks(
filtered
);

}

/* ==========================
   PERIOD FILTER
========================== */

function filterByPeriod(
taskList,
period
){

const today =
new Date();

if(period === "today"){

const todayStr =
today
.toISOString()
.split("T")[0];

return taskList.filter(
task=>

task.taskDate ===
todayStr

);

}

if(period === "week"){

const weekAgo =
new Date();

weekAgo.setDate(
today.getDate()-7
);

return taskList.filter(
task=>{

const d =
new Date(
task.taskDate
);

return d >= weekAgo;

});

}

/* LAST N DAYS */

const days =
parseInt(period);

if(!isNaN(days)){

const target =
new Date();

target.setDate(
today.getDate()-days
);

return taskList.filter(
task=>{

const d =
new Date(
task.taskDate
);

return d >= target;

});

}

return taskList;

}

/* ==========================
   FILTERED RENDER
========================== */

function renderFilteredTasks(
taskArray
){

taskContainer.innerHTML="";

if(taskArray.length===0){

taskContainer.innerHTML=

"<p>No matching tasks found.</p>";

return;

}

taskArray.forEach(task=>{

const card =
document.createElement(
"div"
);

card.className =
"task-card";

card.innerHTML =

`
<div class="task-title">

${task.taskName}

</div>

<div class="task-desc">

${task.description || ""}

</div>

<div class="task-meta">

<span>

📅 ${task.taskDate}

</span>

<span>

⏰ ${task.dueTime}

</span>

<span>

📂 ${task.category}

</span>

<span class="badge ${task.status.toLowerCase()}">

${task.status}

</span>

</div>

<div class="task-actions">

<button
class="btn-pass"
onclick="markPassed('${task.id}')">

Pass

</button>

<button
class="btn-fail"
onclick="markFailed('${task.id}')">

Fail

</button>

<button
class="btn-edit"
onclick="editTask('${task.id}')">

Edit

</button>

<button
class="btn-delete"
onclick="deleteTask('${task.id}')">

Delete

</button>

</div>
`;

taskContainer.appendChild(
card
);

});

}

/* ==========================
   WEEKLY PRODUCTIVITY
========================== */

function getWeeklyProductivity(){

const today =
new Date();

const weekAgo =
new Date();

weekAgo.setDate(
today.getDate()-7
);

const weekTasks =
tasks.filter(task=>{

const d =
new Date(
task.taskDate
);

return d >= weekAgo;

});

if(
weekTasks.length===0
)
return 0;

const completed =
weekTasks.filter(
t=>
t.status==="Passed"
).length;

return Math.round(

(completed /
weekTasks.length)

*100

);

}

/* ==========================
   MONTHLY PRODUCTIVITY
========================== */

function getMonthlyProductivity(){

const now =
new Date();

const month =
now.getMonth();

const year =
now.getFullYear();

const monthTasks =
tasks.filter(task=>{

const d =
new Date(
task.taskDate
);

return (

d.getMonth()
=== month

&&

d.getFullYear()
=== year

);

});

if(
monthTasks.length===0
)
return 0;

const completed =
monthTasks.filter(
t=>
t.status==="Passed"
).length;

return Math.round(

(completed /
monthTasks.length)

*100

);

}

/* ==========================
   WEEKLY EXPENSE
========================== */

function getWeeklyExpense(){

const today =
new Date();

const weekAgo =
new Date();

weekAgo.setDate(
today.getDate()-7
);

return expenses
.filter(expense=>{

const d =
new Date(
expense.date
);

return d >= weekAgo;

})
.reduce(
(sum,e)=>
sum + Number(e.amount),
0
);

}

/* ==========================
   MONTHLY EXPENSE
========================== */

function getMonthlyExpense(){

const now =
new Date();

const month =
now.getMonth();

const year =
now.getFullYear();

return expenses
.filter(expense=>{

const d =
new Date(
expense.date
);

return (

d.getMonth()
=== month

&&

d.getFullYear()
=== year

);

})
.reduce(
(sum,e)=>
sum + Number(e.amount),
0
);

}

/* ==========================
   EXTEND DASHBOARD
========================== */

const oldUpdateDashboard =
updateDashboard;

updateDashboard =
function(){

oldUpdateDashboard();

const weekly =
getWeeklyProductivity();

const monthly =
getMonthlyProductivity();

const weekExpense =
getWeeklyExpense();

const monthExpense =
getMonthlyExpense();

setText(
"weeklyProgress",
weekly + "%"
);

setText(
"monthlyProgress",
monthly + "%"
);

setText(
"expenseWeek",
"₹" +
weekExpense
);

setText(
"expenseMonth",
"₹" +
monthExpense
);

};

/* ==========================
   DARK MODE
========================== */

const THEME_KEY =
"ltp_theme";

function loadTheme(){

const saved =
localStorage.getItem(
THEME_KEY
);

if(saved==="light"){

document.body.classList.add(
"light-mode"
);

}

}

loadTheme();

if(themeBtn){

themeBtn.addEventListener(
"click",
toggleTheme
);

}

function toggleTheme(){

document.body.classList.toggle(
"light-mode"
);

const isLight =

document.body.classList.contains(
"light-mode"
);

localStorage.setItem(

THEME_KEY,

isLight
? "light"
: "dark"

);

showToast(
isLight
?
"Light Mode Enabled"
:
"Dark Mode Enabled"
);

}

/* ==========================
   PULL TO REFRESH
========================== */

let startY = 0;

window.addEventListener(
"touchstart",
e=>{

startY =
e.touches[0].clientY;

}
);

window.addEventListener(
"touchend",
e=>{

const endY =
e.changedTouches[0]
.clientY;

if(

window.scrollY===0

&&

(endY-startY)>120

){

renderTasks();

updateDashboard();

showToast(
"Refreshed"
);

}

});

/* ==========================
   SWIPE DELETE
========================== */

let touchStartX = 0;

document.addEventListener(
"touchstart",
e=>{

touchStartX =
e.changedTouches[0]
.clientX;

}
);

document.addEventListener(
"touchend",
e=>{

const endX =
e.changedTouches[0]
.clientX;

if(

touchStartX - endX

> 150

){

showToast(
"Swipe detected"
);

}

});

/* ==========================
   DAILY PRODUCTIVITY ALERT
========================== */

function productivityAlert(){

const today =
new Date()
.toISOString()
.split("T")[0];

const todayTasks =
tasks.filter(
t=>
t.taskDate===today
);

if(
todayTasks.length===0
)
return;

const done =
todayTasks.filter(
t=>
t.status==="Passed"
).length;

const percent =
Math.round(

(done /
todayTasks.length)

*100

);

if(percent < 30){

showToast(

"⚠ Productivity below 30%"

);

}

}

setInterval(

productivityAlert,

300000

);

/* ==========================
   REFRESH DASHBOARD
========================== */

updateDashboard();
applyFilters();

console.log(
"Life Tracker Pro Part-2 Loaded"
);

/* ======================================
   LIFE TRACKER PRO
   APP.JS - PART 3
   CHARTS + ANALYTICS + EXPORT
====================================== */

/* ==========================
   CHART VARIABLES
========================== */

let expensePieChart = null;
let expenseBarChart = null;
let productivityChart = null;

/* ==========================
   EXPENSE DELETE
========================== */

function deleteExpense(id){

if(!confirm("Delete this expense?"))
return;

expenses = expenses.filter(
e => e.id !== id
);

saveLocalData();

updateDashboard();

renderExpenseList();

loadCharts();

showToast(
"Expense Deleted"
);

}

/* ==========================
   EXPENSE EDIT
========================== */

function editExpense(id){

const expense =
expenses.find(
e=>e.id===id
);

if(!expense) return;

const purpose =
prompt(
"Purpose",
expense.purpose
);

if(!purpose) return;

const amount =
prompt(
"Amount",
expense.amount
);

expense.purpose =
purpose;

expense.amount =
Number(amount);

saveLocalData();

updateDashboard();

renderExpenseList();

loadCharts();

showToast(
"Expense Updated"
);

}

/* ==========================
   EXPENSE LIST
========================== */

function renderExpenseList(){

let container =
document.getElementById(
"expenseList"
);

if(!container) return;

container.innerHTML = "";

expenses
.sort(
(a,b)=>
new Date(b.date)
-
new Date(a.date)
)
.forEach(expense=>{

const div =
document.createElement(
"div"
);

div.className =
"task-card";

div.innerHTML =

`
<div class="task-title">
${expense.purpose}
</div>

<div class="task-meta">

<span>
📅 ${expense.date}
</span>

<span>
📂 ${expense.category}
</span>

<span>
₹${expense.amount}
</span>

</div>

<div class="task-desc">
${expense.notes || ""}
</div>

<div class="task-actions">

<button
class="btn-edit"
onclick="editExpense('${expense.id}')">
Edit
</button>

<button
class="btn-delete"
onclick="deleteExpense('${expense.id}')">
Delete
</button>

</div>
`;

container.appendChild(div);

});

}

/* ==========================
   CATEGORY SUMMARY
========================== */

function getCategoryTotals(){

const result = {};

expenses.forEach(expense=>{

if(
!result[expense.category]
){

result[expense.category]=0;

}

result[expense.category] +=
Number(expense.amount);

});

return result;

}

/* ==========================
   PIE CHART
========================== */

function loadExpensePieChart(){

const canvas =
document.getElementById(
"expensePieChart"
);

if(!canvas) return;

const totals =
getCategoryTotals();

if(expensePieChart){

expensePieChart.destroy();

}

expensePieChart =
new Chart(canvas,{

type:"pie",

data:{

labels:
Object.keys(totals),

datasets:[{

data:
Object.values(totals)

}]

},

options:{

responsive:true,

plugins:{

legend:{

position:"bottom"

}

}

}

});

}

/* ==========================
   MONTHLY BAR CHART
========================== */

function loadExpenseBarChart(){

const canvas =
document.getElementById(
"expenseBarChart"
);

if(!canvas) return;

const monthly = {};

expenses.forEach(expense=>{

const date =
new Date(
expense.date
);

const key =

date.toLocaleString(
"default",
{
month:"short"
}
);

if(!monthly[key]){

monthly[key]=0;

}

monthly[key]+=

Number(expense.amount);

});

if(expenseBarChart){

expenseBarChart.destroy();

}

expenseBarChart =
new Chart(canvas,{

type:"bar",

data:{

labels:
Object.keys(monthly),

datasets:[{

label:
"Expenses",

data:
Object.values(monthly)

}]

}

});

}

/* ==========================
   PRODUCTIVITY CHART
========================== */

function loadProductivityChart(){

const canvas =
document.getElementById(
"productivityChart"
);

if(!canvas) return;

const dailyData = {};

tasks.forEach(task=>{

const date =
task.taskDate;

if(!dailyData[date]){

dailyData[date] = {

total:0,

done:0

};

}

dailyData[date].total++;

if(
task.status==="Passed"
){

dailyData[date].done++;

}

});

const labels = [];
const values = [];

Object.keys(dailyData)
.sort()
.forEach(date=>{

labels.push(date);

const d =
dailyData[date];

values.push(

Math.round(
(d.done/d.total)
*100
)

);

});

if(productivityChart){

productivityChart.destroy();

}

productivityChart =
new Chart(canvas,{

type:"line",

data:{

labels,

datasets:[{

label:
"Productivity %",

data:values,

tension:0.4

}]

},

options:{

responsive:true

}

});

}

/* ==========================
   LOAD ALL CHARTS
========================== */

function loadCharts(){

loadExpensePieChart();

loadExpenseBarChart();

loadProductivityChart();

}

/* ==========================
   EXPENSE ANALYTICS
========================== */

function expenseAnalytics(){

const totals =
getCategoryTotals();

console.table(
totals
);

}

/* ==========================
   CSV EXPORT TASKS
========================== */

function exportTasksCSV(){

let csv =

"TaskName,Description,Date,Time,Status,Category\n";

tasks.forEach(task=>{

csv +=

`"${task.taskName}",
"${task.description}",
"${task.taskDate}",
"${task.dueTime}",
"${task.status}",
"${task.category}"\n`;

});

downloadCSV(
csv,
"tasks.csv"
);

}

/* ==========================
   CSV EXPORT EXPENSES
========================== */

function exportExpensesCSV(){

let csv =

"Date,Purpose,Amount,Category,Notes\n";

expenses.forEach(expense=>{

csv +=

`"${expense.date}",
"${expense.purpose}",
"${expense.amount}",
"${expense.category}",
"${expense.notes}"\n`;

});

downloadCSV(
csv,
"expenses.csv"
);

}

/* ==========================
   CSV DOWNLOAD
========================== */

function downloadCSV(
content,
filename
){

const blob =
new Blob(
[content],
{
type:"text/csv"
}
);

const url =
URL.createObjectURL(
blob
);

const a =
document.createElement("a");

a.href = url;

a.download =
filename;

document.body
.appendChild(a);

a.click();

a.remove();

URL.revokeObjectURL(
url
);

showToast(
filename +
" downloaded"
);

}

/* ==========================
   EXCEL EXPORT
========================== */

function exportExcel(){

let rows = [];

rows.push([

"Purpose",

"Amount",

"Category"

]);

expenses.forEach(expense=>{

rows.push([

expense.purpose,

expense.amount,

expense.category

]);

});

let csv = rows
.map(
r=>r.join(",")
)
.join("\n");

downloadCSV(
csv,
"expenses.xls"
);

}

/* ==========================
   OFFLINE SYNC QUEUE
========================== */

const OFFLINE_QUEUE =
"ltp_queue";

function addToQueue(data){

let queue =
JSON.parse(

localStorage.getItem(
OFFLINE_QUEUE
)

) || [];

queue.push(data);

localStorage.setItem(

OFFLINE_QUEUE,

JSON.stringify(queue)

);

}

/* ==========================
   NETWORK STATUS
========================== */

window.addEventListener(
"online",
()=>{

showToast(
"Internet Connected"
);

syncOfflineQueue();

}
);

window.addEventListener(
"offline",
()=>{

showToast(
"Offline Mode"
);

}
);

/* ==========================
   SYNC QUEUE
========================== */

function syncOfflineQueue(){

let queue =
JSON.parse(

localStorage.getItem(
OFFLINE_QUEUE
)

) || [];

if(queue.length===0)
return;

console.log(
"Syncing...",
queue.length
);

localStorage.removeItem(
OFFLINE_QUEUE
);

showToast(
"Offline data synced"
);

}

/* ==========================
   SUMMARY REPORT
========================== */

function generateSummary(){

const totalExpense =
expenses.reduce(
(sum,e)=>
sum + Number(e.amount),
0
);

const totalTasks =
tasks.length;

const passed =
tasks.filter(
t=>
t.status==="Passed"
).length;

console.log({

totalExpense,

totalTasks,

passed

});

}

/* ==========================
   INITIAL LOAD
========================== */

setTimeout(()=>{

renderExpenseList();

loadCharts();

expenseAnalytics();

},1000);

console.log(
"Life Tracker Pro Part-3 Loaded"
);

/* ======================================
   LIFE TRACKER PRO
   APP.JS - PART 4
   GOOGLE APPS SCRIPT INTEGRATION
====================================== */

/* ==========================
   API HELPER
========================== */

async function apiRequest(action,data={}){

try{

const payload = {

action,

...data

};

const response = await fetch(

CONFIG.API_URL,

{
method:"POST",

headers:{
"Content-Type":
"application/json"
},

body:
JSON.stringify(payload)

}

);

const result =
await response.json();

return result;

}
catch(error){

console.error(error);

showToast(
"Server Connection Failed"
);

throw error;

}

}

/* ==========================
   LOAD TASKS
========================== */

/*async function loadTasksFromServer(){

try{

const response =
await fetch(
CONFIG.API_URL +
"?action=getTasks"
);

const result =
await response.json();

tasks =
result.data || [];

renderTasks();

updateDashboard();

}
catch(error){

console.error(error);

}

}

/* ==========================
   LOAD EXPENSES
========================== */

/*async function loadExpensesFromServer(){

const response =
await fetch(
CONFIG.API_URL +
"?action=getExpenses"
);

const result =
await response.json();

expenses =
result.data || [];

renderExpenseList();

updateDashboard();

loadCharts();

}

/* ==========================
   ADD TASK API
========================== */

async function saveTaskToServer(task){

try{

await apiRequest(

"addTask",

task

);

}
catch(error){

addToQueue({

type:"task",

action:"add",

data:task

});

}

}

/* ==========================
   UPDATE TASK API
========================== */

async function updateTaskServer(task){

try{

await apiRequest(

"updateTask",

task

);

}
catch(error){

addToQueue({

type:"task",

action:"update",

data:task

});

}

}

/* ==========================
   DELETE TASK API
========================== */

async function deleteTaskServer(id){

try{

await apiRequest(

"deleteTask",

{id}

);

}
catch(error){

addToQueue({

type:"task",

action:"delete",

id

});

}

}

/* ==========================
   ADD EXPENSE API
========================== */

async function saveExpenseServer(expense){

try{

await apiRequest(

"addExpense",

expense

);

}
catch(error){

addToQueue({

type:"expense",

action:"add",

data:expense

});

}

}

/* ==========================
   UPDATE EXPENSE API
========================== */

async function updateExpenseServer(expense){

try{

await apiRequest(

"updateExpense",

expense

);

}
catch(error){

addToQueue({

type:"expense",

action:"update",

data:expense

});

}

}

/* ==========================
   DELETE EXPENSE API
========================== */

async function deleteExpenseServer(id){

try{

await apiRequest(

"deleteExpense",

{id}

);

}
catch(error){

addToQueue({

type:"expense",

action:"delete",

id

});

}

}

/* ==========================
   OFFLINE QUEUE SYNC
========================== */

async function syncOfflineQueue(){

let queue =
JSON.parse(

localStorage.getItem(
OFFLINE_QUEUE
)

) || [];

if(queue.length===0)
return;

showToast(
"Syncing Offline Data..."
);

for(const item of queue){

try{

await apiRequest(

item.action,

item.data || item

);

}
catch(error){

console.error(error);

}

}

localStorage.removeItem(
OFFLINE_QUEUE
);

showToast(
"Sync Completed"
);

}

/* ==========================
   AUTO SAVE TASKS
========================== */

const originalTaskPush =
tasks.push;

function saveTaskAuto(task){

tasks.push(task);

saveTaskToServer(task);

}

/* ==========================
   DAILY REMINDER
========================== */

function dailyReminder(){

const today =
new Date()
.toISOString()
.split("T")[0];

const pendingTasks =
tasks.filter(

t=>

t.taskDate===today

&&

t.status==="Pending"

);

if(
pendingTasks.length>0
){

showToast(

"📌 " +
pendingTasks.length +
" Pending Tasks Today"

);

}

}

/* ==========================
   PRODUCTIVITY ALERT
========================== */

function sendProductivityAlert(){

const today =
new Date()
.toISOString()
.split("T")[0];

const todayTasks =
tasks.filter(
t=>
t.taskDate===today
);

if(
todayTasks.length===0
)
return;

const completed =
todayTasks.filter(
t=>
t.status==="Passed"
).length;

const productivity =
Math.round(

(completed /
todayTasks.length)

*100

);

if(productivity < 50){

showToast(
"⚠ Productivity below 50%"
);

}
else{

showToast(
"🔥 Great productivity!"
);

}

}

/* ==========================
   AUTO BACKUP
========================== */

function autoBackup(){

const backup = {

tasks,

expenses,

backupDate:
new Date()
.toISOString()

};

localStorage.setItem(

"ltp_backup",

JSON.stringify(
backup
)

);

console.log(
"Backup Created"
);

}

/* ==========================
   RESTORE BACKUP
========================== */

function restoreBackup(){

const backup =
localStorage.getItem(
"ltp_backup"
);

if(!backup){

showToast(
"No Backup Found"
);

return;

}

const data =
JSON.parse(
backup
);

tasks =
data.tasks || [];

expenses =
data.expenses || [];

saveLocalData();

renderTasks();

renderExpenseList();

updateDashboard();

loadCharts();

showToast(
"Backup Restored"
);

}

/* ==========================
   APP HEALTH CHECK
========================== */

function healthCheck(){

console.log({

tasks:
tasks.length,

expenses:
expenses.length,

online:
navigator.onLine,

time:
new Date()

});

}

/* ==========================
   SCHEDULED SERVICES
========================== */

setInterval(

dailyReminder,

1800000

);

setInterval(

sendProductivityAlert,

3600000

);

setInterval(

autoBackup,

900000

);

setInterval(

healthCheck,

600000

);

/* ==========================
   STARTUP
========================== */

window.addEventListener(

"load",

()=>{

showToast(
"Life Tracker Pro Ready"
);

updateDashboard();

renderTasks();

renderExpenseList();

loadCharts();

}

);



function jsonResponse(obj){

return ContentService
.createTextOutput(
JSON.stringify(obj)
)
.setMimeType(
ContentService.MimeType.JSON
);

}
