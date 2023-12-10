import React, { useEffect } from 'react'

const PhotoEditor = () => {
    
    useEffect(() => {
        const editor = document.getElementById("editor");
        const context = editor.getContext("2d");
        const toolbar = document.getElementById("toolbar");
    
        const tools = {
            "upload": function () {
                const upload = document.createElement('input');
                upload.type = "file";
                upload.click();
                upload.onchange = function () {
                  const img = new Image();
                  img.onload = () => {
                    const maxWidth = window.innerWidth; // Maximum width of the visible screen
                    const maxHeight = window.innerHeight; // Maximum height of the visible screen
              
                    // Calculate the aspect ratio of the image
                    const aspectRatio = img.width / img.height;
              
                    // Calculate the new dimensions to fit within the visible screen
                    let newWidth = maxWidth;
                    let newHeight = maxWidth / aspectRatio;
              
                    // If the calculated height is greater than the maximum height, adjust the dimensions
                    if (newHeight > maxHeight) {
                      newHeight = maxHeight;
                      newWidth = maxHeight * aspectRatio;
                    }
              
                    // Set the canvas dimensions and draw the image
                    editor.width = newWidth;
                    editor.height = newHeight;
                    context.drawImage(img, 0, 0, newWidth, newHeight);
                  };
                  img.onerror = () => {
                    console.error("The provided file couldn't be loaded as an Image media");
                  };
              
                  img.src = URL.createObjectURL(this.files[0]);
                };
        },
        "save" : function(){
            const image = editor.toDataURL();
            const link = document.createElement('a');
            link.download = 'image.png';
            link.href = image;
            link.click();
        },
        "flipHor" : function(){
            let cols = editor.width; // Width is number of columns
            let rows = editor.height; // Height is number of rows
            let image = getRGBArray(rows, cols);

            for(let i=0;i<Math.floor(rows/2);i++){
                for(let j=0;j<cols;j++){
                    let tmp = image[i][j];
                    image[i][j] = image[rows-1-i][j];
                    image[rows-1-i][j] = tmp;
                }
            }
            setImageData(image, rows, cols);
        },
        "flipVert" : function(){
            let cols = editor.width; // Width is number of columns
            let rows = editor.height; // Height is number of rows
            let image = getRGBArray(rows, cols);

            for(let i=0;i<rows;i++){
                for(let j=0;j<Math.floor(cols/2);j++){
                    let tmp = image[i][j];
                    image[i][j] = image[i][cols-1-j];
                    image[i][cols-1-j] = tmp;
                }
            }
            setImageData(image, rows, cols);
        },
        "rotateL" : function () {
            let cols = editor.width; // Width is number of columns
            let rows = editor.height; // Height is number of rows
            let image = getRGBArray(rows, cols);

            let limage = [];
            for(let i=cols-1;i>=0;i--){
                let row = [];
                for(let j=0;j<rows;j++){
                    row.push(image[j][i]);
                }
                limage.push(row);
            }
            setImageData(limage, cols, rows);
        },
        "rotateR" : function () {
            let cols = editor.width; // Width is number of columns
            let rows = editor.height; // Height is number of rows
            let image = getRGBArray(rows, cols);

            let rimage = [];
            for(let i=0;i<cols;i++){
                let row = [];
                for(let j=rows-1;j>=0;j--){
                    row.push(image[j][i]);
                }
                rimage.push(row);
            }
            setImageData(rimage, cols, rows);
        },
        "resize" : function(){
            let cols = editor.width; // Width is number of columns
            let rows = editor.height; // Height is number of rows
            let image = getRGBArray(rows, cols);

            let inp = prompt('Current Width : '+cols + '\n' + 'Current Height : '+rows + '\n' + 'Give the new width and height in a space separated manner').split(' ');
            if(inp.length!==2){
                alert('Incorrect dimensions in input');
                return;
            }
            let ncols = parseInt(inp[0]);
            let nrows = parseInt(inp[1]);
            if(isNaN(ncols) || isNaN(nrows)){
                alert('Input is not a proper number');
                return;
            }

            let hratio = rows/nrows;
            let wratio = cols/ncols;

            let nimage = [];
            for(let i=0;i<nrows;i++){
                let row = [];
                for(let j=0;j<ncols;j++){
                    row.push(image[Math.floor(i*hratio)][Math.floor(j*wratio)]);
                }
                nimage.push(row);
            }
            setImageData(nimage, nrows, ncols);
        },
        "greyscale" : function(){
            let cols = editor.width; // Width is number of columns
            let rows = editor.height; // Height is number of rows
            let image = getRGBArray(rows, cols);

            for(let i=0;i<rows;i++){
                for(let j=0;j<cols;j++){
                    let pixel = image[i][j];
                    let shade = Math.floor(0.3*pixel[0]+0.59*pixel[1]+0.11*pixel[2]);
                    image[i][j][0] = image[i][j][1] = image[i][j][2] = shade;
                }
            }
            setImageData(image, rows, cols);
        }
    };

    for (let button of toolbar.children) {
        if (button.nodeName === "BUTTON") {
          button.onclick = function (event) {
            event.preventDefault();
            tools[this.id].call(this);
          }
        }
      }

    function setImageData(data, rows, cols) {
        const Image = Array.from({ length: rows*cols*4 });
        for(let i = 0;i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                for (let k = 0; k < 4; k++) {
                    Image[( i*cols + j ) * 4 + k ] = data[i][j][k];
                }
            }
        }
        const idata = context.createImageData(cols, rows);
        idata.data.set(Image);
        editor.width = cols;
        editor.height = rows;
        context.putImageData(idata, 0, 0);
    }

    function getRGBArray(rows, cols) {
        let data = context.getImageData(0, 0, cols, rows).data;
        const RGBImage = [];
        for(let i=0;i<rows;i++){
            let row = [];
            for(let j=0;j<cols;j++){
                let pixel = [];
                for(let k=0;k<4;k++){
                    pixel.push( data[ ( i*cols + j ) * 4 + k ] );
                }
                row.push(pixel);
            }
            RGBImage.push(row);
        }
        return RGBImage;
    }
},[]);

  return (
    <div className='bg-gray-300 w-full h-full pb-10'>
       <nav className="flex justify-between py-1 px-3 bg-white shadow-xl sticky top-0">
            <img 
                src="https://th.bing.com/th/id/OIP.wOuocoy_uxHEyAMwz96CAQHaB-?w=532&h=142&rs=1&pid=ImgDetMain" 
                className="w-60 h-full" alt="" 
            />
        </nav>
        <div id="w-full bg-white px-4">
            <div className="m-auto text-center">
                <div className="pt-24 pb-6 px-0 md:px-20">
                    <section className='block'>
                        <canvas id="editor" className='shadow-lg p-4 block m-auto w-fit h-fit border-2 border-dashed border-black rounded-sm bg-white'></canvas>
                        {/* <img 
                            src="https://www.freeiconspng.com/uploads/upload-icon-30.png"  // Replace with the path to your logo image
                            alt="Upload Logo"
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20"
                        /> */}
                    </section>
                </div>

                <section id="toolbar" className='grid grid-cols-2 gap-4 w-[100%] md:w-[30%] m-auto px-4 md:px-0'>
                    <button id="upload" className='m-auto' title="Upload">
                        <img src="https://cdn4.iconfinder.com/data/icons/arrows-246/24/upload_1-512.png" 
                          alt="upload here" 
                          className="w-16 border-2 border-black rounded-full p-1" 
                        />
                    </button>
                    <button id="save" className='m-auto' title="Save">
                        <img src="https://static.thenounproject.com/png/357987-200.png" 
                            alt="download here" 
                            className="w-16 text-black border-2 border-black rounded-full p-1" 
                        />
                    </button>
                    <button id="flipHor" className="py-2 px-4 mx-1 rounded-md text-white text-md font-semibold bg-green-600" title="Flip Horizontally">Flip Horizontally</button>
                    <button id="flipVert" className="py-2 px-4 mx-1 rounded-md text-white text-md font-semibold bg-green-600" title="Flip vertically">Flip vertically</button>
                    <button id="rotateL" className="py-2 px-4 mx-1 rounded-md text-white text-md font-semibold bg-green-600" title="Rotate left">Rotate Left</button>
                    <button id="rotateR" className="py-2 px-4 mx-1 rounded-md text-white text-md font-semibold bg-green-600" title="Rotate right">Rotate Right</button>
                    <button id="resize" className="py-2 px-4 mx-1 rounded-md text-white text-md font-semibold bg-green-600" title="Resize">Resize</button>
                    <button id="greyscale" className="py-2 px-4 mx-1 rounded-md text-white text-md font-semibold bg-green-600" title="Convert to grayscale">Grayscale</button>
                </section>
            </div>
        </div>
    </div>
  )
}

export default PhotoEditor