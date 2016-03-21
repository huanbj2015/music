function $(s){
    return document.querySelectorAll(s);
}

var lis = $("#list li");

for(var i=0;i<lis.length;i++){

    lis[i].onclick=function(){
        for(var j=0;j<lis.length;j++){
           lis[j].className='';
        }
        this.className='selected';
        load("/audio/"+this.title);
    }
}

var xhr=new XMLHttpRequest();
var ac=new (window.AudioContext||window.webkitAudioContext)();
var gainNode=ac[ac.createGain?"createGain":"createGainNode"]();
gainNode.connect(ac.destination);
var analyser=ac.createAnalyser();
var size=128;
analyser.fftSize=size*2;
analyser.connect(gainNode);
var source=null;
var count=0;
var box=$("#box")[0];
var height,width;
var canvas=document.createElement("canvas");
var ctx=canvas.getContext("2d");
box.appendChild(canvas);
var Dots;
function random(m,n){
    return Math.round(Math.random()*(n-m)+m);
}

function getDots(){
    Dots=[];
    for(var i=0;i<size;i++){
        var x=random(0,width);
        var y=random(0,height);
        var color="rgba("+random(0,255)+","+random(0,255)+","+random(0,255)+",0)";
            Dots.push({
                x:x,
                y:y,
                dx:random(1,4),
                color:color,
                cape:0
            })
    }

}
var line;
function resize(){
    height=box.clientHeight;
    width=box.clientWidth;
    canvas.height=height;
    canvas.width=width;
    line=ctx.createLinearGradient(0,0,0,height);
    line.addColorStop(0,"red");
    line.addColorStop(0.5,"yellow");
    line.addColorStop(1,"green");

    getDots();
}
resize();
window.onresize=resize;


function load(url){
    var n=++count;
    source&&source[source.stop?"stop":"noteOff"]();
    xhr.abort();
    xhr.open('GET',url);
    xhr.responseType='arraybuffer';
    xhr.onload=function(){
        if(n!=count)return;
        ac.decodeAudioData(xhr.response,function(buffer){
            if(n!=count)return;
            var bufferSource=ac.createBufferSource();
            bufferSource.buffer=buffer;
            bufferSource.connect(analyser);
            bufferSource[bufferSource.start?"start":"noteOn"](0);
            source=bufferSource;

        },function(err){
            console.log(err);
        });

    }
    xhr.send();
}

function changeVolume(percent){
    gainNode.gain.value=percent;
}
$("#volume")[0].onchange=function(){
    changeVolume(this.value/this.max);
}
function vasualizer(){
    var arr=new Uint8Array(analyser.frequencyBinCount);
    requestAnimationFrame=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame;
    function v(){
        analyser.getByteFrequencyData(arr);
        draw(arr);
        requestAnimationFrame(v);
    }
    requestAnimationFrame(v);
}
vasualizer();

draw.type="column";
var types=$("#type li");
for(var i=0;i<types.length;i++){
    types[i].onclick=function(){
        for(var j=0;j<types.length;j++){
            types[j].className="";
        }
        this.className="selected";
        draw.type=this.getAttribute("data-type");
    }
}


function draw(arr){
    var w=width/size;
    var cw=w*0.6;
    var capH=cw;
    ctx.clearRect(0,0,width,height);
    ctx.fillStyle=line;
    for(var i=0;i<size;i++){
        var o=Dots[i];
        if(draw.type=="column"){
            var h=arr[i]/256*height;

            ctx.fillRect(w* i,height-h,cw,h);
            ctx.fillRect(w* i,height-(o.cap+capH),cw,capH);
            o.cap--;
            if(o.cap<0){
                o.cap=0;
            }
            if(o.cap>0&&o.cap>h+40){
                o.cap=h+100;
            }
        }else if (draw.type=="dot"){

            var r=10+arr[i]/256*(height>width?width:height)/10;
            ctx.beginPath();
            ctx.arc(o.x, o.y,r,0,Math.PI*2,true);
           var g=ctx.createLinearGradient(o.x, o.y,0,o.x,o.y,r);
            g.addColorStop(0,"#fff");
            g.addColorStop(1, o.color);
            ctx.fillStyle=g;
            ctx.fill();
            o.x+=o.dx;
            o.x= o.x>width?0: o.x;
        }
    }
}
