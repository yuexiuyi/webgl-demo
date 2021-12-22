class Gl {
  constructor(canvas){
    this.gl = canvas.getContext("webgl");

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
      console.log(offset)
      const location = gl.getAttribLocation(program, key);
      gl.vertexAttribPointer(location, length, gl.FLOAT, false, stride*fSize, offset*fSize);
      gl.enableVertexAttribArray(location)
    }
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


  drawTriangle(count){
    const { gl } = this;
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // 用不透明黑色清空画布
    // 清除画布在绘制前
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // gl.drawArrays(gl.TRIANGLES, 0, count);//三角形
    // gl.drawArrays(gl.TRIANGLE_STRIP, 0, count);//三角形带
    gl.drawArrays(gl.TRIANGLE_FAN, 0, count);//三角形扇
  }

}
