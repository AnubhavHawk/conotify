const block = document.getElementById('vaccine-center');
const pinInput = document.getElementById('pinInput');
const btn = document.getElementById('btn');

if(localStorage.getItem('pincode')){
    pinInput.value = localStorage.getItem('pincode')
}

btn.addEventListener('click', () => {
    let pincode = pinInput.value
    setPinCode(pincode)
})

let setPinCode = (p) =>{
    let pincode = pinInput.value;
    localStorage.setItem('pincode', p)
}


let compare = (a, b) => {
    return a.time - b.time;
}
let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
var audio = new Audio('notification.mp3');

var centersArray = [];
var vaccineHTML = "";
var index = 0;
var i = 0;
let refreshRate = 1000; // <-----------------------------------Frequency
let flag = false;

// Call it every 5 seconds.
let refresh = setInterval(()=>{
    if(i == 5){
        i = 0;
        block.innerHTML = vaccineHTML
        vaccineHTML = "";
        centersArray = [];
        if(flag)
            audio.play();
    }
    if(i == 1){
        // don't exceed the API call limit. 100 calls per 5min
        refreshRate = 2*60*1000; // every 2 minute.
    }
    if(!localStorage.getItem('pincode'))
        return;
    let date = new Date();    
    date.setDate(date.getDate() + i) // for the next coming dates
    let dateString = date.getDate() + "-" + (date.getMonth()+1) + "-" + date.getFullYear();
    
    vaccineHTML += `<h4 class="col-12 text-left mt-3">${date.getDate() + " " + months[date.getMonth()] + " " + date.getFullYear()}</h4>
                    <div class="col-11 text-left">
                        <hr class="mt-1">
                    </div>`
    // make API calls
    let url = "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByPin?pincode=" + localStorage.getItem('pincode') +"&date="+dateString;
    fetch(url)
        .then(res => res.json())
        .then(data => {
            data.time = date.getTime();
            data.date = dateString;
            centersArray.push(data);
            centersArray.sort(compare);
            if(centersArray[i].sessions.length > 0){
                for(let j = 0; j < centersArray[i].sessions.length; j++){
                    if(centersArray[i].sessions[j].min_age_limit < 45 && centersArray[i].sessions[j].available_capacity_dose1 > 0){ // <<<--------------Here is the condition for notifying users.
                        flag = true;
                        audio.play();
                    }
                    vaccineHTML += '<div class="col-md-6 mb-3 text-left">'
                    if(centersArray[i].sessions[j].min_age_limit < 45 && centersArray[i].sessions[j].available_capacity_dose1 > 0){
                        vaccineHTML += '<div class="bg-dark p-3 rounded available">';
                    }
                    else{
                        vaccineHTML += '<div class="bg-dark p-3 rounded">';
                    }
                    vaccineHTML += `<div class="d-flex justify-content-between text-white">
                                                <h5>${centersArray[i].sessions[j].name}</h5>
                                                <p class="text-warning">${centersArray[i].sessions[j].min_age_limit}+</p>
                                            </div>
                                            <p>${centersArray[i].sessions[j].address}</p>`
                    if(centersArray[i].sessions[j].available_capacity_dose1 > 0){
                        vaccineHTML += `<span class="badge badge-success text-white">Available</span>
                                            <div class="row pt-3 pl-3 pr-3">`
                        for(let k = 0; k < centersArray[i].sessions[j].slots.length; k++){
                            vaccineHTML += `<span class="bg-light col-4 text-center mb-2 mr-2 rounded">${centersArray[i].sessions[j].slots[k]}</span>`
                        }
                        vaccineHTML += `</div>
                                            </div>
                                        </div>`
                    }else{
                        vaccineHTML += '<span class="badge badge-danger text-white">Booked</span></div></div>';
                    }
                }
            }
            else{
                vaccineHTML +=   `<div class="col-md-6 mb-3 text-left">
                                    <div class="bg-dark p-3 rounded">
                                        <h3>No Info found</h3>
                                    </div>
                                </div>`
            }
            i++;
        })
}, refreshRate)