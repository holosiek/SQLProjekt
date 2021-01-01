const { app, BrowserWindow } = require('electron')
const sql = require('mssql/msnodesqlv8');
const ipc = require('electron').ipcMain;

const pool = new sql.ConnectionPool({
	database: 'SzkolaDB',
	server: '127.0.0.1\\SQLEXPRESS',
	driver: 'msnodesqlv8',
	options: {
		trustedConnection: true
	}
})

function createWindow(){
	const win = new BrowserWindow({
		width: 1600,
		height: 900,
		webPreferences: {
			nodeIntegration: true
		}
	})	
	win.loadFile('index.html')
}

//--------------------------------------------------------------

const StudentID = "21"
const ProfileQuery = "SELECT * FROM dbo.wyswietl_ucznia("+StudentID+")";
const ScheduleQuery = "SELECT [ID], [Od Kiedy] FROM [SzkolaDB].[dbo].[Czas Zajec]";
const ScheduleQuery2 = "SELECT * FROM dbo.plan_lekcji('1A')";
const ScheduleQuery3 = "SELECT [Kiedy] FROM [SzkolaDB].[dbo].[Dni Wolne]"
const GradesQuery = "SELECT * FROM dbo.wypisz_oceny("+StudentID+")";
const GradesQuery2 = "SELECT [Nazwa Przedmiotu] FROM [SzkolaDB].[dbo].[Spis Przedmiotów]";
const ComplainsQuery = "SELECT * FROM dbo.wypisz_uwagi("+StudentID+")";

function GetProfileData(event){
	pool.connect().then(()=>{
		pool.request().query(ProfileQuery, (err, result) => {
			if(result != undefined){
				event.sender.send('update-profile-callback', JSON.stringify(result.recordset));
			} else {
				event.sender.send('update-profile-callback', "");
				console.log(err)
			}
		})
	})
}

function GetScheduleData(event){
	res = {'Godziny':[],'Zajecia':[],'Dni Wolne':[]}
	pool.connect().then(()=>{
		pool.request().query(ScheduleQuery, (err, result) => {
			if(result != undefined){
                res["Godziny"] = result.recordset;
				pool.request().query(ScheduleQuery2, (err2, result2) => {
                    if(result2 != undefined){
                        res["Zajecia"] = result2.recordset;
                        pool.request().query(ScheduleQuery3, (err3, result3) => {
                            if(result3 != undefined){
                                res["Dni Wolne"] = result3.recordset;
                                event.sender.send('update-schedule-callback', JSON.stringify(res));
                            } else {
                                event.sender.send('update-schedule-callback', "");
                                console.log(err3)
                            }
                        })
                    } else {
                        event.sender.send('update-schedule-callback', "");
                        console.log(err2)
                    }
                })
			} else {
				event.sender.send('update-schedule-callback', "");
				console.log(err)
			}
		})
    })
}

function GetGradesData(event){
	res = {'Nazwy Przedmiotow':[],'Oceny':[]}
	pool.connect().then(()=>{
		pool.request().query(GradesQuery, (err, result) => {
			if(result != undefined){
				res["Oceny"] = result.recordset;
				pool.request().query(GradesQuery2, (err2, result2) => {
					if(result2 != undefined){
						res["Nazwy Przedmiotow"] = result2.recordset;
						event.sender.send('update-grades-callback', JSON.stringify(res));
					} else {
						event.sender.send('update-grades-callback', "");
                        console.log(err2)
					}
				})
			} else {
				event.sender.send('update-grades-callback', "");
				console.log(err)
			}
		})
	})
}

function GetComplainsData(event){
	pool.connect().then(()=>{
		pool.request().query(ComplainsQuery, (err, result) => {
			if(result != undefined){
				event.sender.send('update-complains-callback', JSON.stringify(result.recordset));
			} else {
				event.sender.send('update-complains-callback', "");
				console.log(err)
			}
		})
	})
}



ipc.on('update-profile', (event, arg) => {
	GetProfileData(event);
})

ipc.on('update-schedule', (event, arg) => {
	GetScheduleData(event);
})

ipc.on('update-grades', (event, arg) => {
	GetGradesData(event);
})

ipc.on('update-complains', (event, arg) => {
	GetComplainsData(event);
})
//---------------------------------------------------------------

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow()
	}
})