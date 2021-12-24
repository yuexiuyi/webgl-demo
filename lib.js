class Gl {
  constructor(canvas){
    this.gl = canvas.getContext("webgl");
    this.canvas = canvas;
    this.texUnits = {};

    if(!this.gl){
      alert('无法初始化Webgl，你的浏览器、操作系统或硬件等可能不支持WebGL。')
      return;
    }
  }

  // 创建指定类型的着色器，上传source源码并编译
  loadShader({ type, source }){
    const { gl } =this;

    const shader = gl.createShader(type);

    // 传递source给着色器对象

    gl.shaderSource(shader,source);

    // 编译着色器程序

    gl.compileShader(shader);

    // 判断是否编译成功

    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){
      alert('着色器编译失败：' + gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  // 初始化着色器程序，让WebGL知道如何绘制我们的数据
  initShadeProgram({vsSource,fsSource}){
    const { gl } =this;
    const vertexShader = this.loadShader({ type:gl.VERTEX_SHADER, source:vsSource});//创建顶点着色器
    const fragmentShader = this.loadShader({ type:gl.FRAGMENT_SHADER, source:fsSource});//创建片元着色器

    // 创建着色器程序
    this.program = gl.createProgram();
    const { program } =this;
    gl.attachShader(program,vertexShader);
    gl.attachShader(program,fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    // 创建失败
    if(!gl.getProgramParameter(program,gl.LINK_STATUS)){
      alert('初始化程序失败：'+ gl.getProgramInfoLog(program));
      return null;
    }

    return program;
  }


  /**
   * 创建程序参数信息
   * @param {*} params
   */
  setProgramParams({params}){
    for (let key in params) {
      let value = params[key];
      let type = key.slice(0, 1);
      if (type === 'a') {
       this.getFunction({value,key,fType:'a'})
      } else {
       this.getFunction({value,key,fType:'u'})
      }
    }
  }

  /**
   * value 为数组  uniform[1234]fv
   * value 为对象  uniform[1234]f
   * value 子元素值 默认为float类型
   * @param {*} value
   * @returns
   */
  getFunction({value,key,fType}) {
    const { gl, program } = this;
    const locations = {};
    let isArray = Array.isArray(value) ;
    let isVector = isArray ? 'v' : '';
    let funIndex = isArray ? value.length : 1;
    let matrix = ''
    let func = '';
    const type = 'f';

    if (isTypedArray(value)) {
      matrix = 'Matrix';
      isVector = 'v'
      funIndex = '4'
    }
    if (fType === 'u') {
      locations[key] = gl.getUniformLocation(program, key);
      func = 'uniform';
    } else {
      locations[key] = gl.getAttribLocation(program, key);
      func = 'vertexAttrib';
    }

    let funcName = `${func}${matrix}${funIndex}${type}${isVector}`

    if (isTypedArray(value)) {
      gl[funcName](locations[key] ,false,value);
    }
    else {
      gl[funcName](locations[key] ,value);
    }
  }

  setBuffers({ bufferParams }) {
    const { gl,program } = this;
    for (const key in bufferParams) {
      const item = bufferParams[key];
      const length = item.length ? item.length : 1;
      const offset = item.offset ? item.offset : 0;
      const stride = item.stride ? item.stride : 0;
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, item.value, gl.STATIC_DRAW);
      const location = gl.getAttribLocation(program, key);
      gl.vertexAttribPointer(location, length, gl.FLOAT, false, stride, offset);
      gl.enableVertexAttribArray(location)
    }
  }

  setBuffer({ bufferParams }) {
    const { gl, program } = this;
    const { keys, value } = bufferParams;
    const fSize = value.BYTES_PER_ELEMENT;
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, value, gl.STATIC_DRAW);

    for (const key in keys) {
      const item = keys[key];
      const length = item.length ? item.length : 1;
      const offset = item.offset ? item.offset : 0;
      const stride = item.stride ? item.stride : 0;
      const location = gl.getAttribLocation(program, key);
      gl.vertexAttribPointer(location, length, gl.FLOAT, false, stride*fSize, offset*fSize);
      gl.enableVertexAttribArray(location)
    }

  }

  setBufferIndex({ index }) {
    const { gl } = this;
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index, gl.STATIC_DRAW);
  }


  drawPoint(count){
    const { gl } = this;
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // 用不透明黑色清空画布
    // 清除画布在绘制前
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if (count > 1) {
      gl.drawArrays(gl.POINTS, 0, count);
    } else {
      gl.drawArrays(gl.POINT, 0, 1);
    }
  }

  drawLine(count){
    const { gl } = this;
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // 用不透明黑色清空画布
    // 清除画布在绘制前
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // gl.drawArrays(gl.LINES, 0, count);//线段
    // gl.drawArrays(gl.LINE_STRIP, 0, count);//折线
    gl.drawArrays(gl.LINE_LOOP, 0, count);//循环线段
  }


  drawTriangle(count,offset,noClear){
    const { gl } = this;
    offset = offset ? offset : 0;
    if (!noClear) {
      gl.clearColor(0.0, 0.0, 0.0, 1.0);  // 用不透明黑色清空画布
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }
    gl.enable(gl.DEPTH_TEST);//open depth test
    gl.enable(gl.POLYGON_OFFSET_FILL);//open polygon offset
    // gl.polygonOffset(1.0, 1.0);
    // 清除画布在绘制前
    gl.drawArrays(gl.TRIANGLES, offset, count);//三角形
    // gl.drawArrays(gl.TRIANGLE_STRIP, 0, count);//三角形带
    // gl.drawArrays(gl.TRIANGLE_FAN, 0, count);//三角形扇
  }


  drawTriangleByElements(count,offset,noClear){
    const { gl } = this;
    offset = offset ? offset : 0;
    if (!noClear) {
      gl.clearColor(0.0, 0.0, 0.0, 1.0);  // 用不透明黑色清空画布
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }
    gl.enable(gl.DEPTH_TEST);//open depth test
    gl.enable(gl.POLYGON_OFFSET_FILL);//open polygon offset
    // gl.polygonOffset(1.0, 1.0);
    // 清除画布在绘制前
    gl.drawElements(gl.TRIANGLES,count,gl.UNSIGNED_BYTE,0);//三角形
    // gl.drawArrays(gl.TRIANGLE_STRIP, 0, count);//三角形带
    // gl.drawArrays(gl.TRIANGLE_FAN, 0, count);//三角形扇
  }


  initTexture({key,texUnit,draw,src}) {
    const { gl, program } = this;
    const texture = gl.createTexture();
    const uSampler = gl.getUniformLocation(program, key)
    const image = new Image();
    image.crossOrigin= 'Anonymous'
    this.texUnits[texUnit] = false;
    image.onload = () => {
      this.loadTexture({ texture, uSampler, image, texUnit });
      let isAllLoad = true;
      for (const key in this.texUnits) {
        const isLoad = this.texUnits[key];
        isAllLoad = isLoad ? isLoad : false;
      }
      if (isAllLoad) {
        draw();
      }
    }
    image.src = src;
  }

  loadTexture({texture,uSampler,image,texUnit}) {
    const { gl } = this;
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    const key = `TEXTURE${texUnit}`;
    this.texUnits[texUnit] = true;
    gl.activeTexture(gl[key]);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(uSampler, texUnit)
  }

  setViewMatrix({ eyes, center, normal }) {
    const { gl, program } = this;
    const key= 'uViewMatrix';
    const viewMatrix = new Matrix4();
    viewMatrix.setLookAt(eyes.x,eyes.y,eyes.z,center.x,center.y,center.z, normal.x,normal.y,normal.z);
    const uViewMatrix = gl.getUniformLocation(program, key)
    gl.uniformMatrix4fv(uViewMatrix,false,viewMatrix.elements);
  }

  setModelMatrix({ angle, axis }) {
    const { gl, program } = this;
    const key= 'uModelMatrix';
    const modelMatrix = new Matrix4();
    const x = axis === 'x' ? 1 : 0;
    const y = axis === 'y' ? 1 : 0;
    const z = axis === 'z' ? 1 : 0;
    modelMatrix.setRotate(angle,x,y,z);
    const uModelMatrix = gl.getUniformLocation(program, key)
    gl.uniformMatrix4fv(uModelMatrix,false,modelMatrix.elements);
  }

  setOrtho({ left, right, bottom, top, near, far }) {
    const { gl, program } = this;
    const key= 'uProMatrix';
    const proMatrix = new Matrix4();
    left = left !== undefined ? left : -1.0;
    right = right !== undefined ? right : 1.0;
    bottom = bottom !== undefined ? bottom: -1.0;
    top = top !== undefined ? top : 1.0;
    near = near !== undefined ? near : 0.0;
    far = far !== undefined ? far : 1.0;
    proMatrix.setOrtho(left, right, bottom, top, near, far);
    const uProMatrix = gl.getUniformLocation(program, key)
    gl.uniformMatrix4fv(uProMatrix,false,proMatrix.elements);
  }


  setPerspective({ fovy, aspect, near, far }) {
    const { gl, program } = this;
    const key= 'uProMatrix';
    const proMatrix = new Matrix4();
    const canvas = this.canvas;
    const { width, height } = canvas;
    fovy = fovy !== undefined ? fovy : 1.0;
    aspect = aspect !== undefined ? aspect: width / height;
    near = near !== undefined ? near : 0.0;
    far = far !== undefined ? far : 1.0;
    proMatrix.setPerspective(fovy, aspect, near, far);
    const uProMatrix = gl.getUniformLocation(program, key)
    gl.uniformMatrix4fv(uProMatrix,false,proMatrix.elements);
  }


  setMVPMatrix({ fovy, aspect, near, far, eyes, center, normal}) {
    const { gl, program } = this;
    const canvas = this.canvas;
    const { width, height } = canvas;
    const uMVPMatrix = gl.getUniformLocation(program, 'uMVPMatrix');
    fovy = fovy !== undefined ? fovy : 1.0;
    aspect = aspect !== undefined ? aspect: width / height;
    near = near !== undefined ? near : 0.0;
    far = far !== undefined ? far : 1.0;
    const MVPMatrix = new Matrix4();
    MVPMatrix.setPerspective(fovy, aspect, near, far);
    MVPMatrix.setLookAt(eyes.x, eyes.y, eyes.z, center.x, center.y, center.z, normal.x, normal.y, normal.z);
    // console.log(MVPMatrix)
    gl.uniformMatrix4fv(uMVPMatrix, false, MVPMatrix.elements);
  }
}
