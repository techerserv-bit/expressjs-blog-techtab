console.log("main.js running");
const cP = document.getElementById("createPost");

function onLoad(){
    document.getElementById("createPost").style.display ="none";
    // fetchCourseData()
}

function fetchCourseData(){
    const ajax = new XMLHttpRequest();
    ajax.onload = function() {
        document.getElementById("courseContent").innerHTML = this.responseText;
    }
    ajax.open("GET", "http://127.0.0.1:7000/course", true);
    ajax.send();
}