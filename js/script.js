// Visual Studio Special by adding three slash and use <reference path="" />
/// <reference path="./src/gl-matrix.js"/>
/// <reference path="../js/jquery-3.2.0.min.js"/>

// Put outside because in jquery , cannot execute . It needs pure JS
let gl = b.getContext("webgl2"),
  w = b.width = window.innerWidth,
  h = b.height = window.innerHeight;

  if(!gl){
    alert("GL Needed");
  }

function createCube() {

  var cube = {}; //Cube Object

  // Make Cube ! (Cube have 36 vertices)
  cube.vertices = [
    // Front face (x,y,z)
    -0.5, -0.5, 0.5,
    0.5, -0.5, 0.5,
    -0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, -0.5, 0.5,
    -0.5, 0.5, 0.5,


    // Back face (x,y,z)
    -0.5, -0.5, -0.5,
    0.5, -0.5, -0.5,
    -0.5, 0.5, -0.5,
    -0.5, 0.5, -0.5,
    0.5, -0.5, -0.5,
    0.5, 0.5, -0.5,

    // Top face (x,y,z)
    -0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    -0.5, 0.5, -0.5,
    -0.5, 0.5, -0.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, -0.5,


    // Bottom face (x,y,z)
    -0.5, -0.5, 0.5,
    0.5, -0.5, 0.5,
    -0.5, -0.5, -0.5,
    -0.5, -0.5, -0.5,
    0.5, -0.5, 0.5,
    0.5, -0.5, -0.5,

    // Right face (x,y,z)
    0.5, 0.5, 0.5,
    0.5, -0.5, 0.5,
    0.5, -0.5, -0.5,
    0.5, 0.5, 0.5,
    0.5, -0.5, -0.5,
    0.5, 0.5, -0.5,

    // Left face (x,y,z)
    -0.5, 0.5, 0.5,
    -0.5, -0.5, 0.5,
    -0.5, -0.5, -0.5,
    -0.5, 0.5, 0.5,
    -0.5, -0.5, -0.5,
    -0.5, 0.5, -0.5,
  ];

  cube.positionBuffer = gl.createBuffer();
  // Bind Buffer to GPU cubeVertexPositionBuffer
  gl.bindBuffer(gl.ARRAY_BUFFER, cube.positionBuffer);
  // send cubeVertices to array buffer
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube.vertices), gl.STATIC_DRAW);

  cube.colors = [];

  // Make every cube faces to be the same color (rgba value)
  let faceColors = [
    [0.2, 0.1, 0.5, 1.0], // Front Face
    [0.0, 1.0, 0.0, 1.0], // Back Face
    [0.7, 0.2, 0.5, 1.0], // Top Face
    [0.0, 1.0, 0.6, 1.0], // Bottom Face
    [0.0, 0.0, 0.5, 0.0], // Right Face
    [0.0, 1.0, 1.0, 1.0] // Left Face
  ];

  // Cannot send to GPU, we do some looping technique to do all those colors to be on the same faces
  // Loop until 6 because have 6 faces
  faceColors.forEach(function (color) {
    for (var i = 0; i < 6; i++) {
      cube.colors = cube.colors.concat(color); // this will send the each array to cube.colors
    }
  });

  // console.log('colors', cube.colors.toString());


  cube.colorBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, cube.colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube.colors), gl.STATIC_DRAW);


  cube.vertexShader = getAndCompileVertexShader("vertexShader");
  cube.fragmentShader = getAndCompileFragmentShader("fragmentShader");
  // Then we have to tell them to combine vertexShader into fragmentShader into the program
  cube.shaderProgram = gl.createProgram();
  // then you have to attach this shader into program (Two Parameters)
  gl.attachShader(cube.shaderProgram, cube.vertexShader);
  gl.attachShader(cube.shaderProgram, cube.fragmentShader);
  gl.linkProgram(cube.shaderProgram);
  // Special Code for program detected error
  if (!gl.getProgramParameter(cube.shaderProgram, gl.LINK_STATUS)) {
    alert("Could not initialize shaders");
  }

  // After successful , we use the program down here
  /************************************************************************************************************* 
  Note : But still those shaders do not know how to get these data from memory , only those data from program
  *************************************************************************************************************/
  gl.useProgram(cube.shaderProgram);

  const FLOAT_SIZE = 4;
  /*************************************************************************************************************
  Get All the 'position' in vec3 position into the program
  *************************************************************************************************************/
  cube.positionAttributePosition = gl.getAttribLocation(cube.shaderProgram, "position");
  // This will enable to send those attributes into vertex that passed from 'position' vertex
  gl.enableVertexAttribArray(cube.positionAttributePosition);
  // Then you bind the buffer into cube.positionBuffer
  gl.bindBuffer(gl.ARRAY_BUFFER, cube.positionBuffer);
  // void gl.vertexAttribPointer(index,size(position have 3 components : x , y, z),type,normalized,stride,offset(Can set read cubeVertices at size value))
  gl.vertexAttribPointer(cube.positionAttributePosition, 3, gl.FLOAT, false, 0, 0);

  /*************************************************************************************************************
  Get All the 'position' in vec3 position into the program
  *************************************************************************************************************/
  cube.colorAttributePosition = gl.getAttribLocation(cube.shaderProgram, "color");
  // This will enable to send those attributes into vertex that passed from 'position' vertex
  gl.enableVertexAttribArray(cube.colorAttributePosition);
  // Then you bind the buffer into cube.positionBuffer
  gl.bindBuffer(gl.ARRAY_BUFFER, cube.colorBuffer);
  // void gl.vertexAttribPointer(index,size(position have 3 components : x , y, z),type,normalized,stride,offset(Can set read cubeVertices at size value))
  gl.vertexAttribPointer(cube.colorAttributePosition, 4, gl.FLOAT, false, 0, 0);

  cube.modelMatrix = mat4.create();
  cube.modelMatrixLocation = gl.getUniformLocation(cube.shaderProgram, "modelMatrix");


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

  return cube;
}


$(function () {

  // Now just call and function that returns the object
  var cube = createCube();

  // console.log("What is GL ? "+gl);

  // This will create new identity
  var viewMatrix = mat4.create();
  var projectionMatrix = mat4.create();

  /***********************************************************
          To get uniform matrix from html script
  ***********************************************************/
  var viewMatrixLocation = gl.getUniformLocation(cube.shaderProgram, "viewMatrix");
  var projectionMatrixLocation = gl.getUniformLocation(cube.shaderProgram, "projectionMatrix");

  var angle = 0.1; // put 0.1 , can skip incrementing on rotateY function
  var speed = 0.01;

  // PERSPECTIVE CAMERA
  // .perspective(mat4 out, number fovy, number aspect , Number near, Number far)
  // .perspective(mat4 out , Vertical field of view in radians,viewport width/height,Near bound of matrix,Far bound of matrix)
  mat4.perspective(projectionMatrix, 45 * Math.PI / 360.0, w / h, 0.1, 50);

  var runRenderLoop = () => {
    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, w, h);
    gl.clearColor(0.2, 0.2, 0.7, 1);
    // Clear the screen
    // Clear DEPTH BUFFER so that every cube color become solid !
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // Must put test
    gl.enable(gl.DEPTH_TEST);

    // Cube 1
    mat4.identity(cube.modelMatrix); // this will reset identity so can do incrementing
    // .translate(receiving matrix , matrix to translate ,[x,y,z])
    // .rotateY(the receiving matrix, matrix to rotate, angle to rotate the matrix)
    mat4.translate(cube.modelMatrix, cube.modelMatrix, [0, 0, -10]);
    mat4.rotateY(cube.modelMatrix, cube.modelMatrix, angle);
    mat4.rotateX(cube.modelMatrix, cube.modelMatrix, angle / 2);
    angle += speed;

    // Now to send the actual matrices to this location
    gl.uniformMatrix4fv(cube.modelMatrixLocation, false, cube.modelMatrix);
    gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);
    gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);
    // .drawArrays(gl.TRIANGLES , offset , triangle cubeVertices(num))
    var offset = 0;
    var count = 3 * 12; // 3 vertices * 12 triangles (6 rectangles)
    gl.drawArrays(gl.TRIANGLES, offset, count);
    // Will rerun after the render finish

    // Cube 2
    mat4.identity(cube.modelMatrix); // this will reset identity so can do incrementing
    // .translate(receiving matrix , matrix to translate ,[x,y,z])
    // .rotateY(the receiving matrix, matrix to rotate, angle to rotate the matrix)
    // Change X position
    mat4.translate(cube.modelMatrix, cube.modelMatrix, [2, 0, -10]);
    mat4.rotateY(cube.modelMatrix, cube.modelMatrix, angle);
    mat4.rotateX(cube.modelMatrix, cube.modelMatrix, angle / 2);
    angle += speed;

    // Now to send the actual matrices to this location
    gl.uniformMatrix4fv(cube.modelMatrixLocation, false, cube.modelMatrix);
    gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);
    gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);
    // .drawArrays(gl.TRIANGLES , offset , triangle cubeVertices(num))
    var offset = 0;
    var count = 3 * 12; // 3 vertices * 12 triangles (6 rectangles)
    gl.drawArrays(gl.TRIANGLES, offset, count);

    // Cube 3
    mat4.identity(cube.modelMatrix); // this will reset identity so can do incrementing
    // .translate(receiving matrix , matrix to translate ,[x,y,z])
    // .rotateY(the receiving matrix, matrix to rotate, angle to rotate the matrix)
    // Change X position
    mat4.translate(cube.modelMatrix, cube.modelMatrix, [-2, 0, -10]);
    mat4.rotateY(cube.modelMatrix, cube.modelMatrix, angle);
    mat4.rotateX(cube.modelMatrix, cube.modelMatrix, angle / 2);
    angle += speed;

    // Now to send the actual matrices to this location
    gl.uniformMatrix4fv(cube.modelMatrixLocation, false, cube.modelMatrix);
    gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);
    gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);
    // .drawArrays(gl.TRIANGLES , offset , triangle cubeVertices(num))
    var offset = 0;
    var count = 3 * 12; // 3 vertices * 12 triangles (6 rectangles)
    gl.drawArrays(gl.TRIANGLES, offset, count);

    requestAnimationFrame(runRenderLoop);
  }


  requestAnimationFrame(runRenderLoop);

  window.addEventListener("resize", () => {
    w = b.width = window.innerWidth;
    h = b.height = window.innerHeight;
  });
});
