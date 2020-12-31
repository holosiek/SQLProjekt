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
    if(data != ""){
        decodeData = JSON.parse(data);
        console.log(data)
        document.getElementById('profile-name').innerHTML = decodeData[0]["Imie"] + " " + decodeData[0]["Nazwisko"] + "<div id='profile-class'>" + decodeData[0]["Nazwa Klasy"] + "</div>";
        document.getElementById('profile-telephone').innerHTML = decodeData[0]["Numer Telefonu Do Rodzica"];
    }
    turnOnTab("profile");
}

function properTime(time){
    if(Number(time[1])+45 >= 60){
        return (Number(time[0])+1) + ":" + (Number(time[1])-15)
    }
    return time[0] + ":" + (Number(time[1])+45)
}

function isValid(data){
    if(data != null){
        return JSON.stringify(data);
    }
    return ""
}

function gotSchedule(data){
    prep = "<table><tr><th></th><th>Poniedziałek</th><th>Wtorek</th><th>Środa</th><th>Czwartek</th><th>Piątek</th></tr>";
    if(data != ""){
        decodeData = JSON.parse(data);
        console.log(data)
        subjects = [{},{},{},{},{}]
        for(var i=0; i<decodeData["Godziny"].length; i++){
            for(var j=0; j<5; j++){
                subjects[j][i] = null
            }
        }
        for(var i=0; i<decodeData["Zajecia"].length; i++){
            subjects[Number(decodeData["Zajecia"][i]["Dzien"])-1][Number(decodeData["Zajecia"][i]["Kiedy"])] = decodeData["Zajecia"][i]
        }
        for(var i=0; i<decodeData["Godziny"].length; i++){
            var hourTime = decodeData["Godziny"][i]["Od Kiedy"].split(":")
            hourTimeStr = decodeData["Godziny"][i]["Od Kiedy"] + "-" + properTime(hourTime)
            prep += "<tr><td>" + hourTimeStr + "</td><td>" + isValid(subjects[0][i]) + "</td><td>" + isValid(subjects[1][i]) + "</td><td>" + isValid(subjects[2][i]) + "</td><td>" + isValid(subjects[3][i]) + "</td><td>" + isValid(subjects[4][i]) + "</td></tr>"
        }
    }
    document.getElementById('schedule').innerHTML = prep+"</table>";
    turnOnTab("schedule");
}

function gotGrades(data){
    grades = {}
    prep = "<table><tr><th>Nazwa Przedmiotu</th><th>Oceny</th></tr>";
    if(data != ""){
        decodeData = JSON.parse(data);
        console.log(data)
        for(var i=0; i<decodeData["Nazwy Przedmiotow"].length; i++){
            grades[decodeData["Nazwy Przedmiotow"][i]["Nazwa Przedmiotu"]] = []
        }
        if(decodeData["Oceny"][0]["Nazwa Przedmiotu"] != null){
            for(var i=0; i<decodeData["Oceny"].length; i++){
                var klasa = "gradePower-" + decodeData["Oceny"][i]["Waga"];
                grades[decodeData["Oceny"][i]["Nazwa Przedmiotu"]].push(
                    "<div class='grade "+klasa+"'>"+decodeData["Oceny"][i]["Ocena"]+
                    "<span class='tooltiptext'>Typ: "+
                    decodeData["Oceny"][i]["Nazwa"]+"<br>Waga: "+
                    decodeData["Oceny"][i]["Waga"]+"<br>Kiedy: "+
                    decodeData["Oceny"][i]["Kiedy"].replace('T', ' ').replace('Z', '').split(".")[0]+"<br>Wpisał: "+
                    decodeData["Oceny"][i]["Imie Nauczyciela"]+" "+decodeData["Oceny"][i]["Nazwisko Nauczyciela"]+
                    "</span></div>"
                )
            } 
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
    if(data != ""){
        decodeData = JSON.parse(data);
        console.log(data)
        if(decodeData[0]["Opis Uwagi"] != null){
            prep = "<table><tr><th>Opis</th><th>Wystawił</th></tr>";
            for(var i=0; i<decodeData.length; i++){
                prep += "<tr><td>"+decodeData[i]["Opis Uwagi"]+"</td><td>"+decodeData[i]["Imie Nauczyciela"]+" "+decodeData[i]["Nazwisko Nauczyciela"]+"</td></tr>";
            }
            document.getElementById('complains').innerHTML = prep+"</table>";
        } else {
            document.getElementById('complains').innerHTML = "<div class='complains-nothing'>Nie masz uwag :D</div>";
        }
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