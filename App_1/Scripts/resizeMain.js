function checkWindowSize(){
    let windowWidth = window.innerWidth;

    if(windowWidth <= 800){
        windowWidth = 850;
    }

    let windowHeight = window.innerHeight;

    if(windowHeight <= 600){
        windowHeight = 600;
    }
}

window.addEventListener("resize", checkWindowSize);