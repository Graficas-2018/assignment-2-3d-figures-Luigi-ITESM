var projectionMatrix;

var shaderProgram, shaderVertexPositionAttribute, shaderVertexColorAttribute, 
    shaderProjectionMatrixUniform, shaderModelViewMatrixUniform;

var duration = 5000; // ms

// Attributes: Input variables used in the vertex shader. Since the vertex shader is called on each vertex, these will be different every time the vertex shader is invoked.
// Uniforms: Input variables for both the vertex and fragment shaders. These do not change values from vertex to vertex.
// Varyings: Used for passing data from the vertex shader to the fragment shader. Represent information for which the shader can output different value for each vertex.
var vertexShaderSource =    
    "    attribute vec3 vertexPos;\n" +
    "    attribute vec4 vertexColor;\n" +
    "    uniform mat4 modelViewMatrix;\n" +
    "    uniform mat4 projectionMatrix;\n" +
    "    varying vec4 vColor;\n" +
    "    void main(void) {\n" +
    "		// Return the transformed and projected vertex value\n" +
    "        gl_Position = projectionMatrix * modelViewMatrix * \n" +
    "            vec4(vertexPos, 1.0);\n" +
    "        // Output the vertexColor in vColor\n" +
    "        vColor = vertexColor;\n" +
    "    }\n";

// precision lowp float
// This determines how much precision the GPU uses when calculating floats. The use of highp depends on the system.
// - highp for vertex positions,
// - mediump for texture coordinates,
// - lowp for colors.
var fragmentShaderSource = 
    "    precision lowp float;\n" +
    "    varying vec4 vColor;\n" +
    "    void main(void) {\n" +
    "    gl_FragColor = vColor;\n" +
    "}\n";

function initWebGL(canvas)
{
    var gl = null;
    var msg = "Your browser does not support WebGL, " +
        "or it is not enabled by default.";
    try 
    {
        gl = canvas.getContext("experimental-webgl");
    } 
    catch (e)
    {
        msg = "Error creating WebGL Context!: " + e.toString();
    }

    if (!gl)
    {
        alert(msg);
        throw new Error(msg);
    }

    return gl;        
 }

function initViewport(gl, canvas)
{
    gl.viewport(0, 0, canvas.width, canvas.height);
}

function initGL(canvas)
{
    // Create a project matrix with 45 degree field of view
    projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 1, 10000);
}

// TO DO: Create the functions for each of the figures.
// Create the vertex, color and index data for a multi-colored pyramid
function createPyramid(gl, translation, rotationAxis)
{    
    // Vertex Data
    var vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    var conv =  Math.PI / 180;

    var verts = [

       // Face 1
       Math.cos(162 * conv), 0.0, Math.sin(162 * conv),
       0.0, 0.0, 1.0,
       0.0, 1.0, 0.0,

       // Face 2
       0.0, 0.0, 1.0,
       Math.cos(18 * conv), 0.0, Math.sin(18 * conv),
       0.0, 1.0, 0.0,

       // Face 3
       Math.cos(18 * conv), 0.0, Math.sin(18 * conv),
       Math.cos(306 * conv), 0.0, Math.sin(306 * conv),
       0.0, 1.0, 0.0,

       // Face 4
       Math.cos(306 * conv), 0.0, Math.sin(306 * conv),
       Math.cos(234 * conv), 0.0, Math.sin(234 * conv),
       0.0, 1.0, 0.0,

       // Face 5
        Math.cos(234 * conv), 0.0, Math.sin(234 * conv),
        Math.cos(162 * conv), 0.0, Math.sin(162 * conv),
        0.0, 1.0, 0.0,

       // Bottom pentagon
       Math.cos(162 * conv), 0.0, Math.sin(162 * conv), // A
       Math.cos(234 * conv), 0.0, Math.sin(234 * conv), // B
       0.0, 0.0, 1.0, // C
       Math.cos(306 * conv), 0.0, Math.sin(306 * conv), // D
       Math.cos(18 * conv), 0.0, Math.sin(18 * conv) // E

       ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    var faceColors = [
        [1.0, 0.0, 0.0, 1.0], // Face 1
        [0.0, 1.0, 0.0, 1.0], // Face 2
        [0.0, 0.0, 1.0, 1.0], // Face 3
        [1.0, 1.0, 0.0, 1.0], // Face 4
        [1.0, 0.0, 1.0, 1.0], // Face 5
        [0.0, 1.0, 1.0, 1.0]  // Bottom Pentagon
    ];

    // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the pyramid's face.
    var vertexColors = [];
    var typeFace = "";
    // for (var i in faceColors) 
    // {
    //     var color = faceColors[i];
    //     for (var j=0; j < 4; j++)
    //         vertexColors = vertexColors.concat(color);
    // }
    /*for (const color of faceColors) 
    {
        for (var j=0; j < 4; j++)
            vertexColors = vertexColors.concat(color);
    }*/

    for (var i in faceColors){
      var color = faceColors[i];
      if (i > 4) {
        for (var j=0; j < 5; j++)
            vertexColors = vertexColors.concat(color);
      } else {
        for (var j=0; j < 3; j++)
            vertexColors = vertexColors.concat(color);
      }
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    var pyramidIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pyramidIndexBuffer);
    var pyramidIndices = [
        
        0, 1, 2, // Face 1
        3, 4, 5, // Face 2
        6, 7, 8, // Face 3
        9, 10, 11, // Face 4
        12, 13, 14, // Face 5
        15, 16, 17,   16, 17, 18,   17, 18, 19 // Bottom Pentagon

    ];

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(pyramidIndices), gl.STATIC_DRAW);
    
    var pyramid = {
            buffer:vertexBuffer, colorBuffer:colorBuffer, indices:pyramidIndexBuffer,
            vertSize:3, nVerts:20, colorSize:4, nColors: 20, nIndices:24,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()};

    mat4.translate(pyramid.modelViewMatrix, pyramid.modelViewMatrix, translation);

    pyramid.update = function()
    {
        var now = Date.now();
        var deltat = now - this.currentTime;
        this.currentTime = now;
        var fract = deltat / duration;
        var angle = Math.PI * 2 * fract;
    
        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };
    
    return pyramid;
}

// Create the vertex, color and index data for a multi-colored scutoid
function createScutoid(gl, translation, rotationAxis)
{    
    // Vertex Data
    var vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    var conv =  Math.PI / 180;

    var verts = [

       // Top hexagon
       0.5, 1, 0,
       Math.cos(60 * conv)/2, 1, Math.sin(60 * conv)/2,
       Math.cos(300 * conv)/2, 1, Math.sin(300 * conv)/2,
       Math.cos(240 * conv)/2, 1, Math.sin(240 * conv)/2,
       Math.cos(120 * conv)/2, 1, Math.sin(120 * conv)/2,
       -0.5, 1, 0,

       // Face 3
       Math.cos(162 * conv)/2, 0, Math.sin(162 * conv)/2,
       Math.cos(234 * conv)/2, 0, Math.sin(234 * conv)/2,
        -0.5, 1, 0,
       Math.cos(240 * conv)/2, 1, Math.sin(240 * conv)/2,

       // Face 4
       Math.cos(234 * conv)/2, 0, Math.sin(234 * conv)/2,
       Math.cos(306 * conv)/2, 0, Math.sin(306 * conv)/2,
       Math.cos(240 * conv)/2, 1, Math.sin(240 * conv)/2,
       Math.cos(300 * conv)/2, 1, Math.sin(300 * conv)/2,

       // Face 5
       Math.cos(306 * conv)/2, 0, Math.sin(306 * conv)/2,
       Math.cos(18 * conv)/2, 0, Math.sin(18 * conv)/2,
       Math.cos(300 * conv)/2, 1, Math.sin(300 * conv)/2,
       0.5, 1, 0,

       // Bot Pentagon
       Math.cos(162 * conv)/2, 0, Math.sin(162 * conv)/2,
       Math.cos(234 * conv)/2, 0, Math.sin(234 * conv)/2,
       0, 0, 0.5,
       Math.cos(306 * conv)/2, 0, Math.sin(306 * conv)/2,
       Math.cos(18 * conv)/2, 0, Math.sin(18 * conv)/2,

       // Middle
       0, 0.5, 0.5,
       Math.cos(60 * conv)/2, 1, Math.sin(60 * conv)/2,
       Math.cos(120 * conv)/2, 1, Math.sin(120 * conv)/2,

       // Face 1
       0.5, 1, 0,
       Math.cos(60 * conv)/2, 1, Math.sin(60 * conv)/2,
       Math.cos(18 * conv)/2, 0, Math.sin(18 * conv)/2,
       0, 0.5, 0.5,
       0, 0, 0.5,

       // Face 2
       -0.5, 1, 0,
       Math.cos(120 * conv)/2, 1, Math.sin(120 * conv)/2,
       Math.cos(162 * conv)/2, 0, Math.sin(162 * conv)/2,
       0, 0.5, 0.5,
       0, 0, 0.5  


       ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    var faceColors = [
        [1.0, 1.0, 1.0, 1.0], // Top Hexagon
        [1.0, 0.0, 0.0, 1.0], // Face 3
        [0.0, 1.0, 0.0, 1.0], // Face 4
        [0.0, 0.0, 1.0, 1.0], // Face 5
        [1.0, 1.0, 0.0, 1.0], // Pentagon
        [1.0, 0.0, 1.0, 1.0], // Middle
        [0.0, 1.0, 1.0, 1.0], // Face 1
        [1.0, 0.64, 0.12, 1.0]  // Face 2
    ];

    // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the scutoid's face.
    var vertexColors = [];
    // for (var i in faceColors) 
    // {
    //     var color = faceColors[i];
    //     for (var j=0; j < 4; j++)
    //         vertexColors = vertexColors.concat(color);
    // }
    /*for (const color of faceColors) 
    {
        for (var j=0; j < 4; j++)
            vertexColors = vertexColors.concat(color);
    }
     for (var i = 0; i < 1; i++){
      color = faceColors[i];
      for (var j=0; j < 8; j++)
            vertexColors = vertexColors.concat(color);
    }

    for (var i = 1; i < faceColors.length; i++){
      color = faceColors[i];
      for (var j=0; j < 4; j++)
            vertexColors = vertexColors.concat(color);
    }*/

    // Every face has different amount of vertex, every case corresponds to every face at this order

    for (var i = 0; i < faceColors.length; i++){
      color = faceColors[i];
      
      switch(i) {
        case 0:
          for (var j=0; j < 6; j++)
            vertexColors = vertexColors.concat(color);
          break;
        case 1:
          for (var j=0; j < 4; j++)
            vertexColors = vertexColors.concat(color);
          break;
        case 2:
          for (var j=0; j < 4; j++)
            vertexColors = vertexColors.concat(color);
          break;
        case 3:
          for (var j=0; j < 4; j++)
            vertexColors = vertexColors.concat(color);
          break;
        case 4:
          for (var j=0; j < 5; j++)
            vertexColors = vertexColors.concat(color);
          break;
        case 5:
          for (var j=0; j < 3; j++)
            vertexColors = vertexColors.concat(color);
          break;
        case 6:
          for (var j=0; j < 5; j++)
            vertexColors = vertexColors.concat(color);
          break;
        case 7:
          for (var j=0; j < 40; j++)
            vertexColors = vertexColors.concat(color);
          break;
      }
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    var scutoidIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, scutoidIndexBuffer);

    var scutoidIndices = [
        
        0, 1, 2,   1, 2, 3,   1, 3, 4,   3, 4, 5, // Top hexagon
        6, 7, 8,   7, 8, 9, // Face 3
        10, 11, 12,   11, 12, 13, // Face 4
        14, 15, 16,   15, 16, 17, // Face 5
        18, 19, 20,   19, 20, 21,   20, 21, 22, // Pentagon
        23, 24, 25, // Middle
        26, 27, 28,   27, 28, 29,   28, 29, 30, // Face 1
        31, 32, 33,   32, 33, 34,   33, 34, 35 // Face 2
    ];

    //console.log(verts.length/3);

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(scutoidIndices), gl.STATIC_DRAW);
    
    var scutoid = {
            buffer:vertexBuffer, colorBuffer:colorBuffer, indices:scutoidIndexBuffer,
            vertSize:3, nVerts:36, colorSize:4, nColors: 36, nIndices:60,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()};

    mat4.translate(scutoid.modelViewMatrix, scutoid.modelViewMatrix, translation);

    scutoid.update = function()
    {
        var now = Date.now();
        var deltat = now - this.currentTime;
        this.currentTime = now;
        var fract = deltat / duration;
        var angle = Math.PI * 2 * fract;
    
        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };
    
    return scutoid;
}

// Create the vertex, color and index data for a multi-colored octahedron
function createOctahedron(gl, translation, rotationAxis)
{    
    // Vertex Data
    var vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    var conv =  Math.PI / 180;

    var verts = [

       // Face 1
       -0.5, 0, 0.5,
       0.5, 0, 0.5,
       0.0, 1, 0.0,

       // Face 2
       0.5, 0, 0.5,
       0.5, 0, -0.5,
       0.0, 1, 0.0,

       // Face 3
       0.5, 0, -0.5,
       -0.5, 0, -0.5,
       0.0, 1, 0.0,

       // Face 4
       -0.5, 0, -0.5,
       -0.5, 0, 0.5,
       0, 1, 0,

       // Face 5
       -0.5, 0, 0.5,
       0.5, 0, 0.5,
       0.0, -1, 0.0,

       // Face 6
       0.5, 0, 0.5,
       0.5, 0, -0.5,
       0.0, -1, 0.0,

       // Face 7
       0.5, 0, -0.5,
       -0.5, 0, -0.5,
       0, -1, 0,

       // Face 8
       -0.5, 0, -0.5,
       -0.5, 0, 0.5,
       0, -1, 0
       ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    var faceColors = [
        [1.0, 1.0, 1.0, 1.0], // Face 1
        [1.0, 0.0, 0.0, 1.0], // Face 2
        [0.0, 1.0, 0.0, 1.0], // Face 3
        [0.0, 0.0, 1.0, 1.0], // Face 4
        [1.0, 1.0, 0.0, 1.0], // Face 5
        [1.0, 0.0, 1.0, 1.0], // Face 6
        [0.0, 1.0, 1.0, 1.0], // Face 7
        [1.0, 0.64, 0.12, 1.0]  // Face 8
    ];

    // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the octahedron's face.
    var vertexColors = [];
    // for (var i in faceColors) 
    // {
    //     var color = faceColors[i];
    //     for (var j=0; j < 4; j++)
    //         vertexColors = vertexColors.concat(color);
    // }

    // Every face has 3 vertex
    for (const color of faceColors) 
    {
        for (var j=0; j < 3; j++)
            vertexColors = vertexColors.concat(color);
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    var octahedronIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, octahedronIndexBuffer);
    var octahedronIndices = [
        
        0, 1, 2, // Face 1
        3, 4, 5, // Face 2
        6, 7, 8, // Face 3
        9, 10, 11, // Face 4
        12, 13, 14, // Face 5
        15, 16, 17, // Face 6
        18, 19, 20, // Face 7
        21, 22, 23 // Face 8
    ];

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(octahedronIndices), gl.STATIC_DRAW);
    
    var octahedron = {
            buffer:vertexBuffer, colorBuffer:colorBuffer, indices:octahedronIndexBuffer,
            vertSize:3, nVerts:24, colorSize:4, nColors: 24, nIndices:24,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()};

    mat4.translate(octahedron.modelViewMatrix, octahedron.modelViewMatrix, translation);

    // How much does It will move per frame
    moveY = 0.1;

    // Help variable to delimite the figure to the bot and top
    transY = 0;

    octahedron.update = function()
    {
        var now = Date.now();
        var deltat = now - this.currentTime;
        this.currentTime = now;
        var fract = deltat / duration;
        var angle = Math.PI * 2 * fract;
        //console.log(translation[1] + moveY);

        //console.log(transY);

        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        //mat4.identity(this.modelViewMatrix);
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);

        // Translate every frame 0.1 on y axis
        mat4.translate(this.modelViewMatrix, this.modelViewMatrix, [0,moveY,0]);

        // Add to the variable 0.1 every frame
        transY += moveY;

        // The limits of the page are 3 and -3 and this is because we have -10 on z-axis 
        if (transY > 3 || transY < -3)
          // Everytime we hit the limit we need to change the direction of the figure (if it needs to be to the other side we need to multiply by -1)
          moveY *= -1;


    };
    
    return octahedron;
}

function createShader(gl, str, type)
{
    var shader;
    if (type == "fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (type == "vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initShader(gl)
{
    // load and compile the fragment and vertex shader
    var fragmentShader = createShader(gl, fragmentShaderSource, "fragment");
    var vertexShader = createShader(gl, vertexShaderSource, "vertex");

    // link them together into a new program
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // get pointers to the shader params
    shaderVertexPositionAttribute = gl.getAttribLocation(shaderProgram, "vertexPos");
    gl.enableVertexAttribArray(shaderVertexPositionAttribute);

    shaderVertexColorAttribute = gl.getAttribLocation(shaderProgram, "vertexColor");
    gl.enableVertexAttribArray(shaderVertexColorAttribute);
    
    shaderProjectionMatrixUniform = gl.getUniformLocation(shaderProgram, "projectionMatrix");
    shaderModelViewMatrixUniform = gl.getUniformLocation(shaderProgram, "modelViewMatrix");

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }
}

function draw(gl, objs) 
{
    // clear the background (with black)
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT  | gl.DEPTH_BUFFER_BIT);

    // set the shader to use
    gl.useProgram(shaderProgram);

    for(i = 0; i<objs.length; i++)
    {
        obj = objs[i];
        // connect up the shader parameters: vertex position, color and projection/model matrices
        // set up the buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
        gl.vertexAttribPointer(shaderVertexPositionAttribute, obj.vertSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, obj.colorBuffer);
        gl.vertexAttribPointer(shaderVertexColorAttribute, obj.colorSize, gl.FLOAT, false, 0, 0);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indices);

        gl.uniformMatrix4fv(shaderProjectionMatrixUniform, false, projectionMatrix);
        gl.uniformMatrix4fv(shaderModelViewMatrixUniform, false, obj.modelViewMatrix);

        // Draw the object's primitives using indexed buffer information.
        // void gl.drawElements(mode, count, type, offset);
        // mode: A GLenum specifying the type primitive to render.
        // count: A GLsizei specifying the number of elements to be rendered.
        // type: A GLenum specifying the type of the values in the element array buffer.
        // offset: A GLintptr specifying an offset in the element array buffer.
        gl.drawElements(obj.primtype, obj.nIndices, gl.UNSIGNED_SHORT, 0);
    }
}

function run(gl, objs) 
{
    // The window.requestAnimationFrame() method tells the browser that you wish to perform an animation and requests that the browser call a specified function to update an animation before the next repaint. The method takes a callback as an argument to be invoked before the repaint.
    requestAnimationFrame(function() { run(gl, objs); });
    draw(gl, objs);

    for(i = 0; i<objs.length; i++)
        objs[i].update();
}