function resizeSvgs(){
const newWidth=window.innerWidth<=560 ? "100" :null;
tabSvgData.forEach((data,index)=>{
    if(newWidth){
        data.element.setAttribute('width',newWidth);
        }else{
            data.element.setAttribute('width',data.originalWidth);
        }
})
}