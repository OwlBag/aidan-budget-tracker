let db;

const request = indexedDB.open('aidan_budget_tracker', 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_object', { autoIncrement: true });
}

request.onsuccess = function(event) {
    db = event.target.result;

    if (navigator.online) {
        uploadData();
    }
}

request.onerror = function(event) {
    console.log(event.target.errorCode);
}

function saveRecord(record) {
    alert('you have submitted a new transaction without an internet connection, it will be added once you go back online')
    
    const transaction = db.transaction(['new_object'], 'readwrite');

    const objectStore = transaction.objectStore('new_object');

    objectStore.add(record);
}

function uploadData() {
    const transaction = db.transaction(['new_object'], 'readwrite');

    const objectStore = transaction.objectStore('new_object');

    const getAll = objectStore.getAll();
    
    getAll.onsuccess = function() {
        console.log(getAll.result);
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers:  {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }
                const transaction = db.transaction(['new_object'], 'readwrite');

                const objectStore = transaction.objectStore('new_object');

                objectStore.clear();

                alert('All saved transactions have been submitted');
            })
            .catch(err => {
                console.log(err);
            })
        }
    };
}

window.addEventListener('online', uploadData);