/******************************************************************************
 * bar_chart柱形图库
 * @author qiepei01@baidu.com
 * @date 2013-8-1
 *****************************************************************************/
/**
 * @function 生成BarChart对象
 * @param {obj}options 配置项
 * @param {obj}context 上下文环境
 * @Constructor
 * */
function BarChart(options,context){
  this.padding = 20;//the padding is left for labels on Coord Sys
  this.context = context;
  this.data = {};
  this.options = options;
  this.xCoord =[];//array to store the x coords
  this.yCoord = [];//array to store the y coords
  this.ratio = 1;//used to calculate the height of series
}
/**
 * @默认配置项
 * @attr {bool}vertical 是否为竖直图表
 * @attr {Str}animate_dur 动画持续的时间。值为0时，无动画效果
 * @attr {Str}render 渲染方式 DOM|""
 * */
BarChart.prototype.default_options={
  vertical:true,
  animate_dur:"2s",
  render:""
};

/**
 * @Class DOM渲染类
 * */
BarChart.prototype.domrender={
  /**
   * @function 生成绘图容器
   * @param {obj}context 容器所在的上下文环境
   * @return {obj}容器对象
   * */
  createWrapper:function(context){
    var div = document.createElement("div");
    var style="height:100%;width:100%;position:relative;"
    div.setAttribute('style' , style);
    context.appendChild(div);
    return div;
  },
  /**
   * @function 生成直线
   * @param {obj}context 上下文环境
   * @param {Num}x1 直线起点的x坐标
   * @param {Num}y1 直线起点的y坐标
   * @param {Num}x2 直线终点的x坐标
   * @param {Num}y2 直线终点的y坐标
   * @param {Str}color 直线的颜色
   * @return {obj}直线对象
   * */
  createLine:function(context,x1,y1,x2,y2,color){
    var line = document.createElement("div");
    var stroke="1px";
    if(x1 === x2){
      //vertical line
      var style="position:absolute;left:"+x1+"px;top:"+((y1<y2)?y1:y2)
               +"px;width:"+stroke+";height:"+Math.abs(y2-y1)+"px;background:"
               +color+";"
    }else{
      var style="position:absolute;left:"+x1+"px;top:"+((y1<y2)?y1:y2)
               +"px;height:"+stroke+";width:"+Math.abs(x2-x1)+"px;background:"
               +color+";"
    }
    line.setAttribute('style',style);
    context.appendChild(line);
    return line;
  },
  /**
   * @function 生成文本
   * @param {obj}context 上下文环境
   * @param {Str}str 文本的内容
   * @param {Num}x 文本的x坐标
   * @param {Num}y 文本的y坐标
   * @param {Str}color 文本的颜色
   * @return {obj}文本对象
   * */
  createText:function(context,str,x,y,color){
    var text = document.createElement("span");
    var text_padding = 15;
    var style="position:absolute;left:"+x+"px;top:"+(y-text_padding)
             +"px;color:"+color;
    text.setAttribute('style',style);
    text.innerHTML = str;
    context.appendChild(text);
    return text;
  },
  /**
   * @function 生成矩形
   * @param {obj}context 上下文环境
   * @param {Num}x 矩形左上角的x坐标
   * @param {Num}y 矩形左上角的y坐标
   * @param {Num}width 矩形的宽
   * @param {Num}height 矩形的高
   * @param {Str}color 矩形的颜色
   * @return {obj}矩形对象
   * */
  createRect:function(context,x,y,width,height,color){
    var rect = document.createElement("div");
    var style="position:absolute;left:"+x+"px;top:"+y+"px;width:"+width
             +"px;height:"+height+"px;background:"+color+";"
    rect.setAttribute('style',style);
    context.appendChild(rect);
    return rect;
  },
  /**
   * @function 生成动画效果
   * @param {obj}context 上下文环境
   * @param {Str}attr 发生变化的属性
   * @param {Num}from 属性的初始值
   * @param {Num}to 属性的结束值
   * @param {Str}dur 动画持续的时间
   * @return {obj}动画对象
   * */
  createAnimate:function(context,attr,from,to,dur){
    context.style.transition=attr+" "+dur;
	context.style.MozTransition=attr+" "+dur;
	context.style.WebkitTransition=attr+" "+dur;
	
	setTimeout(function(){
		context.style[attr]=to+"px";
	},0);
	
  },
  /**
   * @function 生成群组
   * @param {obj}context 上下文环境
   * @return {obj}群组对象
   * */
  createGroup:function(context){
    var group = document.createElement("div");
    context.appendChild(group);
    return group;
  }
};
/**
 * @function 绘制y轴
 * @param {obj}myyAxis y轴相关的数据配置
 * @param {obj}Render 渲染器
 * @param {obj}context 上下文环境
 * @return {Num}y轴的缩放比例
 * */
BarChart.prototype._draw_yAxis = function(myyAxis,Render,context){
  var yGroup = Render.createGroup(context);
  var width=this.options.chart.width,
      height=this.options.chart.height,
      padding = this.padding,
      x1=y1=x2=padding,
      y2=height-padding,
      color="black",
      yCoord = this.yCoord;
  Render.createLine(yGroup,x1,y1,x2,y2,color);
  if(myyAxis.unit){
    Render.createText(yGroup,"("+myyAxis.unit+")",0,y1,color);
  }
  var yAxis = myyAxis.data;
  var len=0,
      step=0,
      mark=0;
  if(!yAxis || yAxis.length === 0){
    yAxis=[];
    var min,max,dataStep;
    if(myyAxis.min){
      //min = myyAxis.min;
      min=0;
      max=myyAxis.max;
      dataStep=myyAxis.step;
      len = (max-min)/dataStep+1;
    }else{
      var series =this.data.series[0].data;
      //min = Math.min.apply(Math,series);
      min=0;
      max = Math.max.apply(Math,series);
      len = series.length;
      dataStep = (max-min)/(len-1);
    }
    for(var i=0;i<len;i++){
      yAxis.push(min);
      min += dataStep;
    }
  }
  len = yAxis.length;
  step = Math.floor(height/(len+1));
  var yratio = step/(yAxis[1]-yAxis[0]);
  mark = y2;
  var lineWidth = width-padding;
  for(var i=0;i<len;i++){
    Render.createText(yGroup,yAxis[i],0,mark,color);
    yCoord.push({'x':0,'y':mark,'title':yAxis[i]});
    mark -= step;
  }
  if(this.options.vertical){
    mark = y2;
    var gridColor="#ccc";
    for(var i=0;i<len;i++){
      Render.createLine(yGroup,x1,mark,lineWidth,mark,gridColor);
      mark -= step;
    }
  }
  return yratio;
}
/**
 * @function 绘制x轴
 * @param {obj}myxAxis x轴相关的数据配置
 * @param {obj}Render 渲染器
 * @param {obj}context 上下文环境
 * @return {Num}x轴的缩放比例
 * */
BarChart.prototype._draw_xAxis = function(myxAxis,Render,context){
  var xGroup = Render.createGroup(context);
  var width=this.options.chart.width,
      height=this.options.chart.height,
      padding = this.padding,
      x1=padding,
      y1=y2=height - padding,
      x2=width-padding,
      color="black",
      xCoord = this.xCoord;
  Render.createLine(xGroup,x1,y1,x2,y2,color);
  if(myxAxis.unit){
    Render.createText(xGroup,"("+myxAxis.unit+")",width,height,color);
  }
  var xAxis = myxAxis.data;
  if(!xAxis || xAxis.length === 0){
    xAxis=[];
    var min,
        max,
        dataStep;
    if(myxAxis.min){
      //min = myxAxis.min;
      min=0;
      max=myxAxis.max;
      dataStep=myxAxis.step;
      len = (max-min)/dataStep+1;
    }else{
      var series = this.data.series[0].data;
      //min = Math.min.apply(Math,series);
      min=0;
      max = Math.max.apply(Math,series);
      len = series.length;
      dataStep = (max-min)/(len-1);
    }
    for(var i=0;i<len;i++){
      xAxis.push(min);
      min += dataStep;
    }
  }
  len = xAxis.length;
  step = Math.floor(width/(len+1));
  var xratio = step/(xAxis[1]-xAxis[0]);
  mark = x1;
  for(var i=0;i<len;i++){
    Render.createText(xGroup,xAxis[i],mark,height,color);
    xCoord.push({'x':mark,'y':y1,'title':xAxis[i]});
    mark += step;
  }
  if(!this.options.vertical){
    mark = x1;
    for(var i=0;i<len;i++){
      var gridColor="#ccc";
      Render.createLine(xGroup,mark,height-padding,mark,padding,gridColor);
      mark += step;
    }
  }
  return xratio;
}
/**
 * @function 绘制坐标轴
 * @param {obj}Render 渲染器
 * @param {obj}context 上下文环境
 * */
BarChart.prototype._drawAxis = function(Render,context){
  var data = this.data;
  if(this.options.vertical){
    var yratio = this._draw_yAxis(data.yAxis,Render,context);
    var xratio = this._draw_xAxis(data.xAxis,Render,context);
    this.ratio = yratio;
  }else{
    var yratio = this._draw_yAxis(data.xAxis,Render,context);
    var xratio = this._draw_xAxis(data.yAxis,Render,context);
    this.ratio = xratio;
  }
}
/**
 * @function 显示提示信息
 * @param {obj}Event 事件
 * */
BarChart.prototype._showTip = function(event){
  if(this.nodeName.toUpperCase() === "DIV"){
    //DOM
    this.style.border="solid 2px black";
  }else if(this.xmlns){
    //VML
    this.strokecolor="black";
    this.strokeweight="2px";
  }else {
    //SVG
    this.setAttribute("stroke","black");
    this.setAttribute("stroke-width","2");
  }
}
/**
 * @function 隐藏提示信息
 * @param {obj}Event 事件
 * */
BarChart.prototype._hideTip = function(event){
  if(this.nodeName.toUpperCase() === "DIV"){
    //DOM
    this.style.border="";
  }else if(this.xmlns){
    //VML
    this.strokecolor="";
    this.strokeweight="";
  }else{
    //SVG
    this.setAttribute("stroke","");
    this.setAttribute("stroke-width","");
  }
}
/**
 * @function 事件绑定工具
 * @param {obj}elem 待绑定对象
 * @param {string}type 事件类型
 * @param {obj}callback 回调函数
 * */
BarChart.prototype._bindEvent = function(elem, type, callback){
	if(elem.addEventListener){
		elem.addEventListener(type,callback,false);
	}else if(elem.attachEvent){
		elem.attachEvent("on"+type,function(){
			callback.call(elem);
		});
	}else{
		elem["on"+type] = callback;
	}
}
/**
 * @function 绘制数据域
 * @param {obj}Render 渲染器
 * @param {obj}context 上下文环境
 * */
BarChart.prototype._drawSeries = function(Render,context){
  var data = this.data,
      series = data.series[0].data,
      color = data.series[0].color,
      len = series.length,
      height=0,
      width=20,
      padding = this.padding,
      text_padding=10,
      ratio = this.ratio,
      animate_dur = this.options.animate_dur;
  if(this.options.vertical){
    var xCoord = this.xCoord;
    for(var i=0;i<len;i++){
      height = series[i]*ratio;
      if(animate_dur === "0"){
        var rect = Render.createRect(context,xCoord[i].x,xCoord[i].y-height,width,height,color);
      }else{
        if(this.options.method === "DOM"){
          var rect = Render.createRect(context,xCoord[i].x,0,width,height,color);
          Render.createAnimate(rect,"top",0,xCoord[i].y-height,this.options.animate_dur);
        }else{
          var rect = Render.createRect(context,xCoord[i].x,xCoord[i].y-height,width,height,color);
          Render.createAnimate(rect,"y",0,xCoord[i].y-height,this.options.animate_dur);
        }
      }
      rect.setAttribute("value",series[i]);
      this._bindEvent(rect,"mouseover",this.options.mouseover);
      this._bindEvent(rect,"mouseout",this.options.mouseout);
      this._bindEvent(rect,"click",this.options.click);
      var text = Render.createText(context,series[i],xCoord[i].x,xCoord[i].y-height-text_padding,color);
    }
  }else{
    var yCoord = this.yCoord;
    for(var i=0;i<len;i++){
      height = series[i]*ratio;
      if(animate_dur === "0"){
        var rect = Render.createRect(context,yCoord[i].x+padding,yCoord[i].y-width,height,width,color);
      }else{
        if(this.options.method === "DOM"){
          var rect = Render.createRect(context,yCoord[i].x+padding,yCoord[i].y-width,0,width,color);
          Render.createAnimate(rect,"width",0,height,this.options.animate_dur);
        }else{
          var rect = Render.createRect(context,yCoord[i].x+padding,yCoord[i].y-width,height,width,color);
          Render.createAnimate(rect,"width",0,height,this.options.animate_dur);
        }
      }
      rect.setAttribute("value",series[i]);
      this._bindEvent(rect,"mouseover",this.options.mouseover);
      this._bindEvent(rect,"mouseout",this.options.mouseout);
      this._bindEvent(rect,"click",this.options.click);
      Render.createText(context,series[i],yCoord[i].x+padding+height+text_padding,yCoord[i].y,color);
    }
  }
}
/**
 * @function 数据的有效性验证和配置
 * @param {obj}data 图表数据
 * @param {obj}options 图表配置项
 * @return {Bool}是否验证通过
 * */
BarChart.prototype._validate = function(data,options){
  //charge if the data is legal
  if(!data || !(data.series instanceof Array)){
    return false;
  }
  //handle the options,merge or set default
  var myoptions = this.options;
  if(options && options.vertical !== undefined){
    myoptions.vertical = options.vertical;
  }else{
    myoptions.vertical = myoptions.vertical || this.default_options.vertical;
  }
  if(options && options.animate_dur !== undefined){
    myoptions.animate_dur = options.animate_dur;
  }else{
    myoptions.animate_dur = myoptions.animate_dur || this.default_options.animate_dur;
  }
  //handle the event,merge or set default
  var me=this;
  if(data.pointEvent && data.pointEvent.mouseover){
    myoptions.mouseover = function(event){
      me._showTip.call(this,event);
      data.pointEvent.mouseover.call(this,event);
    }
  }else{
    myoptions.mouseover = me._showTip;
  }
  myoptions.mouseout = me._hideTip;
  if(data.pointEvent && data.pointEvent.click){
    myoptions.click = function(event){
      data.pointEvent.click.call(this,event);
    }
  }else{
    myoptions.click = function(){};
  }
  return true;
}
/**
 * @function 绘制图表
 * @param {obj}data 图表数据
 * @param {obj}options 图表配置项
 * @return {Bool}是否验证通过
 * */
BarChart.prototype.update = function(data,options){
  if(! this._validate(data,options)){
    return false;
  }
  this.options.method="DOM";
  var Render = this.domrender;
  this.data=data;
  var wrapper = Render.createWrapper(this.context);
  this._drawAxis(Render,wrapper);
  this._drawSeries(Render,wrapper);
  return true;
}
/**
 * @function 清空图表
 * */
BarChart.prototype.clear = function(){
  this.context.innerHTML = "";
  this.data = {};
  this.xCoord =[];
  this.yCoord = []; 
}
