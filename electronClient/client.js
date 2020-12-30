const ipc = require('electron').ipcRenderer;
const profileBtn = document.getElementById('profileButton')
const scheduleBtn = document.getElementById('scheduleButton')
const gradesBtn = document.getElementById('gradesButton')
const complainsBtn = document.getElementById('complainsButton')
const tabs = ["profile","schedule","grades","complains"]

//---------------------------------------------------------------

profileBtn.addEventListener('click', () => {
    ipc.send('update-profile', "");
})

scheduleBtn.addEventListener('click', () => {
    ipc.send('update-schedule', "");
})

gradesBtn.addEventListener('click', () => {
    ipc.send('update-grades', "");
})

complainsBtn.addEventListener('click', () => {
    ipc.send('update-complains', "");
})

//---------------------------------------------------------------

function turnOnTab(tab){
    for(var i=0; i<tabs.length; i++){
        document.getElementById(tabs[i]).style.display = "none";
        document.getElementById(tabs[i]+"Button").style.backgroundColor = "#222";
    }
    document.getElementById(tab).style.display = "flex";
    document.getElementById(tab+"Button").style.backgroundColor = "#444";
}

//---------------------------------------------------------------

function gotProfile(data){
    document.getElementById('profile').innerHTML = data;
    turnOnTab("profile");
}

function gotSchedule(data){
    document.getElementById('schedule').innerHTML = data;
    turnOnTab("schedule");
}

function gotGrades(data){
    decodeData = JSON.parse(data);
    grades = {}
    prep = "<table><tr><th>Nazwa Przedmiotu</th><th>Oceny</th></tr>";
    console.log(data)
    if(data != ""){
        for(var i=0; i<decodeData["Nazwy Przedmiotow"].length; i++){
            grades[decodeData["Nazwy Przedmiotow"][i]["Nazwa Przedmiotu"]] = []
        } 
        for(var i=0; i<decodeData["Oceny"].length; i++){
            var klasa = "gradePower-" + decodeData["Oceny"][i]["Waga"];
            grades[decodeData["Oceny"][i]["Nazwa Przedmiotu"]].push(
                "<div class='grade "+klasa+"'>"+decodeData["Oceny"][i]["Ocena"]+
                "<span class='tooltiptext'>Typ: "+
                decodeData["Oceny"][i]["Nazwa"]+"<br>Waga: "+
                decodeData["Oceny"][i]["Waga"]+"<br>Kiedy: "+
                decodeData["Oceny"][i]["Kiedy"].replace('T', ' ').replace('Z', '').split(".")[0]+"<br>Wpisał: "+
                decodeData["Oceny"][i]["Imie"]+" "+decodeData["Oceny"][i]["Nazwisko"]+
                "</span></div>"
            )
        } 
        for(var i=0; i<decodeData["Nazwy Przedmiotow"].length; i++){
            var nazwa = decodeData["Nazwy Przedmiotow"][i]["Nazwa Przedmiotu"]
            prep += "<tr><td>" + nazwa + "</td><td>" + grades[nazwa].join('') + "</td></tr>"
        }
    }
    document.getElementById('grades').innerHTML = prep+"</table>";
    turnOnTab("grades");
}

function gotComplains(data){
    decodeData = JSON.parse(data);
    if(data != "" && decodeData[0]["Opis Uwagi"] != null){
        prep = "<table><tr><th>Opis</th><th>Wystawił</th></tr>";
        for(var i=0; i<decodeData.length; i++){
            prep += "<tr><td>"+decodeData[i]["Opis Uwagi"]+"</td><td>"+decodeData[i]["Imie Nauczyciela"]+" "+decodeData[i]["Nazwisko Nauczyciela"]+"</td></tr>";
        }
        document.getElementById('complains').innerHTML = prep+"</table>";
    } else {
        document.getElementById('complains').innerHTML = "<div class='complains-nothing'>Nie masz uwag :D</div>";
    }
    turnOnTab("complains");
}

//---------------------------------------------------------------

ipc.on('update-profile-callback', (event, arg) => {
    gotProfile(arg);
})

ipc.on('update-schedule-callback', (event, arg) => {
    gotSchedule(arg);
})

ipc.on('update-grades-callback', (event, arg) => {
    gotGrades(arg);
})

ipc.on('update-complains-callback', (event, arg) => {
    gotComplains(arg);
})

ipc.send('update-profile', "");