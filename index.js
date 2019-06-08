var collection = "schedules";
var trains = [];
function loadBody() {
  var db = firebase.firestore();

  db.collection(collection)
    .onSnapshot(function (snapshot) {
      snapshot.docChanges().forEach(function (change) {
        if (change.type === "added") {
          var data = change.doc.data();
          trains[trains.length] = data;

          addRow(data);
        }
        if (change.type === "modified") {
          console.log("Modified city: ", change.doc.data());
        }
        if (change.type === "removed") {
          console.log("Removed city: ", change.doc.data());
        }
      });
    });

  startTimer();
}

function addRow(data) {
  var table = document.getElementById("sTable");
  var row = table.insertRow(-1);
  var cell1 = row.insertCell(0);
  var cell2 = row.insertCell(1);
  var cell3 = row.insertCell(2);
  var cell4 = row.insertCell(3);
  var cell5 = row.insertCell(4);

  cell1.innerHTML = data.name;
  cell2.innerHTML = data.dest;
  cell3.innerHTML = data.freq;

  var firstTrain = moment(data.first, "H:mm");
  var now = moment();
  var diff = firstTrain.diff(now, "minutes");

  if (diff < 0) {
    // train left. calculate next arrival
    while (diff < 0) {
      diff = diff + data.freq;
      firstTrain.add(data.freq, 'minutes');
    }
  }
  cell4.innerHTML = firstTrain.format('LLL');;
  cell5.innerHTML = firstTrain.diff(now, "minutes");
}

function startTimer() {
  setInterval(updateTimes, 60000);
}

function updateTimes() {
  var table = document.getElementById("sTable");
  while (table.rows.length > 1) {
    table.deleteRow(1);
  }

  for (var i = 0; i < trains.length; i++) {
    addRow(trains[i]);
  }

}

function addTrain() {
  var nameT = document.getElementById("name").value;
  var destT = document.getElementById("dest").value;
  var firstT = document.getElementById("first").value;
  var freqT = parseInt(document.getElementById("freq").value);

  var db = firebase.firestore();
  db.collection(collection).add({
    name: nameT,
    dest: destT,
    first: firstT,
    freq: freqT
  })
    .then(function (docRef) {
      console.log("Document written with ID: ", docRef.id);
      document.getElementById("name").value="";
      document.getElementById("dest").value="";
      document.getElementById("first").value="";
      document.getElementById("freq").value="";
    })
    .catch(function (error) {
      console.error("Error adding document: ", error);
    });
}