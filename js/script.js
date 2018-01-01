// Visual Studio Special by adding three slash and use <reference path="" />
/// <reference path="./src/gl-matrix.js"/>
/// <reference path="../js/jquery-3.2.0.min.js"/>

$(function () { 
  let gl = b.getContext("webgl2"),
    w = b.width = window.innerWidth,
    h = b.height = window.innerHeight;
    
  // console.log("What is GL ? "+gl);

  // Make Cube ! (Cube have 36 vertices)
  let cubeVertices = [
    // Front face (x,y,z)
    0,0,0,
    20,0,0,
    0,20,0,
    0,20,0,
    20,0,0,
    20,20,0,

    // Back face (x,y,z)
    0, 0, 20,
    20, 0, 20,
    0, 20, 20,
    0, 20, 20,
    20, 0, 20,
    20, 20, 20,

    // Top face (x,y,z)
    0, 20, 0,
    20, 20, 0,
    0, 20, 20,
    0, 20, 20,
    20, 20, 0,    
    20, 20, 20,
    

    // Bottom face (x,y,z)
    0,0,0,
    20,0,0,
    0,0,20,
    0,0,20,
    20,0,0,
    20,20,20,

    // Right face (x,y,z)
    20,20,0,
    20,0,0,
    20,0,20,
    20,0,20,
    20,20,20,
    20,20,0,

    // Left face (x,y,z)
    0,0,0,
    0,0,20,
    0,20,0,
    0,20,0,
    0,20,20,
    0,0,20
  ];

  let cubeVertexPositionBuffer = gl.createBuffer();
  // Bind Buffer to GPU cubeVertexPositionBuffer
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
  // send cubeVertices to array buffer
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVertices), gl.STATIC_DRAW);

  let colors = [];

  // Make every cube faces to be the same color (rgba value)
  let faceColors = [
    [1.0, 0.0, 0.0, 1.0], // Front Face
    [0.0, 1.0, 0.0, 1.0], // Back Face
    [1.0, 0.0, 0.0, 1.0], // Top Face
    [0.0, 1.0, 0.0, 1.0], // Bottom Face
    [0.0, 1.0, 0.0, 1.0], // Right Face
    [1.0, 0.0, 0.0, 1.0] // Left Face
  ];

  // Cannot send to GPU, we do some looping technique to do all those colors to be on the same faces
  faceColors.forEach(function (color) {
    for(var i = 0; i < 6; i++) {
      colors = colors.concat(color); // this will send the each array to colors
    }
  });

  // console.log('colors', colors.toString());
  

  var colorBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);


  var vertexShader = getAndCompileVertexShader("vertexShader");
  var fragmentShader = getAndCompileFragmentShader("fragmentShader");
  // Then we have to tell them to combine vertexShader into fragmentShader into the program
  var shaderProgram = gl.createProgram();
  // then you have to attach this shader into program (Two Parameters)
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  // Special Code for program detected error
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Could not initialize shaders");
  }

  // After successful , we use the program down here
  /************************************************************************************************************* 
  Note : But still those shaders do not know how to get these data from memory , only those data from program
  *************************************************************************************************************/
  gl.useProgram(shaderProgram);

  const FLOAT_SIZE = 4;
  /*************************************************************************************************************
  Get All the 'position' in vec3 position into the program
  *************************************************************************************************************/
  var positionAttributePosition = gl.getAttribLocation(shaderProgram, "position");
  // This will enable to send those attributes into vertex that passed from 'position' vertex
  gl.enableVertexAttribArray(positionAttributePosition);
  // Then you bind the buffer into cubeVertexPositionBuffer
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
  // void gl.vertexAttribPointer(index,size(position have 3 components : x , y, z),type,normalized,stride,offset(Can set read cubeVertices at size value))
  gl.vertexAttribPointer(positionAttributePosition, 3, gl.FLOAT, false, 0, 0);

  /*************************************************************************************************************
  Get All the 'position' in vec3 position into the program
  *************************************************************************************************************/
  var colorAttributePosition = gl.getAttribLocation(shaderProgram, "color");
  // This will enable to send those attributes into vertex that passed from 'position' vertex
  gl.enableVertexAttribArray(colorAttributePosition);
  // Then you bind the buffer into cubeVertexPositionBuffer
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  // void gl.vertexAttribPointer(index,size(position have 3 components : x , y, z),type,normalized,stride,offset(Can set read cubeVertices at size value))
  gl.vertexAttribPointer(colorAttributePosition, 4, gl.FLOAT, false, 0, 0);


  /*****************************************************************************************************************/

  // In this method , you can define any vertex shader and just call this function . EASY !
  function getAndCompileVertexShader(id) {
    var shader;

    var shaderElement = document.getElementById(id);
    // .trim() will remove all the empty first line and last line of the text
    var shaderText = shaderElement.text.trim();

    shader = gl.createShader(gl.VERTEX_SHADER);
    // gl.shaderSource(Two Parameters :: shader , shaderSource);
    gl.shaderSource(shader, shaderText);
    // Then Compiled them together
    gl.compileShader(shader);
    // console.log("Get Vertex Shader Element :: " + shaderText);

    // After this line is extensive provided code if the shader is not successfully imported
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert(gl.getShaderInfoLog(shader));
      return null;
      // This function will show false
    }

    return shader;
  }

  // Next , do the same for fragment shader
  function getAndCompileFragmentShader(id) {
    var shader;

    var shaderElement = document.getElementById(id);
    // .trim() will remove all the empty first line and last line of the text
    var shaderText = shaderElement.text.trim();
    // Just create shader for special fragment shader down here
    shader = gl.createShader(gl.FRAGMENT_SHADER);
    // gl.shaderSource(Two Parameters :: shader , shaderSource);
    gl.shaderSource(shader, shaderText);
    // Then Compiled them together
    gl.compileShader(shader);
    // console.log("Get Fragment Shader Element :: " + shaderText);

    // After this line is extensive provided code if the shader is not successfully imported
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert(gl.getShaderInfoLog(shader));
      return null;
      // This function will show false
    }

    return shader;
  }

  // This will create new identity
  var modelMatrix = mat4.create();
  var viewMatrix = mat4.create();
  var projectionMatrix = mat4.create();

  // PERSPECTIVE CAMERA
  // .perspective(mat4 out, number fovy, number aspect , Number near, Number far)
  mat4.perspective(projectionMatrix,45*Math.PI/180.0,w/h,0.1,50);

  /***********************************************************
          To get uniform matrix from html script
  ***********************************************************/
  var modelMatrixLocation = gl.getUniformLocation(shaderProgram, "modelMatrix");
  var viewMatrixLocation = gl.getUniformLocation(shaderProgram, "viewMatrix");
  var projectionMatrixLocation = gl.getUniformLocation(shaderProgram, "projectionMatrix");


  var angle = 0.1; // put 0.1 , can skip incrementing on rotateY function

  var runRenderLoop = () => {
    // Make black color function
    gl.clearColor(0, 0, 0, 1);
    // Before put color , we clean the color buffer bit
    // gl.clear(gl.COLOR_BUFFER_BIT);
    // Clear the screen
    gl.clear(gl.COLOR_BUFFER_BIT);
    // Then DRAW TRIANGLE ! Yey !
    // .rotateY(the receiving matrix, matrix to rotate, angle to rotate the matrix)
    mat4.identity(modelMatrix); // this will reset identity so can do incrementing
    // .translate(receiving matrix , matrix to translate ,[x,y,z])
    mat4.translate(modelMatrix,modelMatrix,[0,0,-22]);
    mat4.rotateY(modelMatrix,modelMatrix,angle);
    angle += 0.1;
    
    // Now to send the actual matrices to this location
    gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix);
    gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);
    gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);
    // .drawArrays(gl.TRIANGLES , offset , triangle cubeVertices(num))
    var offset = 0;
    var count = 3 * 12; // 3 vertices * 12 triangles (6 rectangles)
    gl.drawArrays(gl.TRIANGLES, offset, count);
    // Will rerun after the render finish

    requestAnimationFrame(runRenderLoop);
  }


  requestAnimationFrame(runRenderLoop);

  window.addEventListener("resize", () => {
    w = b.width = window.innerWidth;
    h = b.height = window.innerHeight;
  });
});
