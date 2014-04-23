/**
 * @Des Sunny-fx.js SunnyJS 动画组件，必须依赖于Sunny.js。
 * 实现基本动画控制（包括颜色，透明度，其他，暂没有实现border宽度高度颜色动画，若在动画中使用这些样式，则产生异常），动画队列控制，方法连写等内容；
 * @Update:
 * 		1.若动画终止样式与初始样式一致，停止动画执行，提升健壮性和性能；2011.10.26 
 * 		2.当动画样式属性从大值渐变到小值时，动画直接过渡到最终样式，没有渐变效果，修复该BUG。2011.10.26 
 * @Since 2011.10.26 
 * @Author Mr.Zhou
 * @Version 1.01 DEBUG
 * @Copyright (c) 2011 Mr.Zhou
 * @Licensed under the MIT3.0 license.
 */

(function(upper){
		  
	//缓存boss对象
	var Sny = upper.Sunny,upper = upper;
	
	/**
	 * {Object Sunny} SunnyFX 动画基类
	 */
	var SunnyFX = upper.Sunny.SunnyFX = Class(Sny,{
		/**
		 * Create {Function function}:动画基类构造函数
		 * @param {String|others} 创建Person类
		 * @param {String|others} 作者
		 * @param {String|others} 日期
		 * @param {String|others} 类说明
		 */  
		Create:function(version,author,date,des){
		    this.version = version;
			this.author = author;
			this.date = date;
			this.des = des;
			//部分属性值不应该小于0的样式
			this.gtZero = {
			    width:"width",
			    height:"height",
			    opacity:"opacity",
			    color:"color",
			    backgroundColor:"background-color"};
			/**
			 * {Object Sunny.Queue} queueFX Sunny.js核心库的队列对象实例
			 * @date : 2011.10.26 0:58
			 */
			this.queueFX = New(Sny.Queue,["1.0","周源","2011.11.26","基于Sunny.js构建的动画组件队列对象实例"]);
		},
		/**
		 * {object Sunny} 上层接口
		 * @date : 2011.10.26 0:58
		 */
		parent:upper.Sunny,
		/**
		 * initAnimate {Function function}:初始化动画实例，每个动画实例可以对某个元素完成多种动画操作，以及队列实现。
		 * @param {String|HTMLElement} 动画实例的元素对象
		 * @param {JSON} 动画内容
		 * @param {String} 动画持续时间
		 * @param {String} 动画类型
		 * @param {function} 回调函数
		 * @return {SunnyFX object} 当前动画对象，便于方法连写
		 */  
		initAnimate:function(el, options, duration, aniType, callback){
			var _this = this
			_this.el = el;
			_this.options = options;
			_this.duration = duration || 0.7;
			_this.aniType = this.tween[aniType || 'easeInOut'];
			_this.callback = callback || function(){};
			_this.animating = false;
			_this.startStyles ={};//动画开始前元素对象的初始样式
			_this.endStyles ={};//元素对象经过动画后的最终样式
		    //_this.getAnimateStyle(this.el,options);//初始化动画样式：放在这里会出现大变小BUG
			return _this;
		},//eOf initAnimate
		
		/**
		 * {Object object} tween Sunny-fx.js动画算法范例
		 */
		tween:{
			linear: function(t, b, c, d){
				return c*t/d + b;
			},
	
			easeIn: function(t, b, c, d) {
				return -c * Math.cos(t/d *(Math.PI/2)) + c + b;
			},  
			
			easeOut: function(t, b, c, d) {
				return c * Math.sin(t/d *(Math.PI/2)) + b;
			}, 
			
			easeInOut: function(t, b, c, d) {
				return -c/2 *(Math.cos(Math.PI*t/d) - 1) + b;
			},
			//指数衰减的反弹缓动
			bounceEaseOut: function(t,b,c,d){
				if ((t/=d) < (1/2.75)) {
					return c*(7.5625*t*t) + b;
				} else if (t < (2/2.75)) {
					return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
				} else if (t < (2.5/2.75)) {
					return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
				} else {
					return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
				}
			},
			//指数衰减的正弦曲线缓动
			elasticEaseOut: function(t,b,c,d,a,p){
				if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
				if (!a || a < Math.abs(c)) { a=c; var s=p/4; }
				else var s = p/(2*Math.PI) * Math.asin (c/a);
				return (a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b);
			}
		},
		
		/**
		 * getAnimateStyle {Function function}:设置元素的动画内容，包括当前动画样式和目标动画样式
		 * @param {HTMLElement} 动画实例的元素对象
		 * @param {JSON} 目标动画样式
		 * @date 2011.10.25 21:04
		 */  
		getAnimateStyle:function(el,styles){
			var startStyles = [],
				endStyles = [],
				_this = this;
			for(style in styles){
				switch(style){
					case 'color':
					case 'borderColor':
					case 'border-color':
					case 'backgroundColor':
					case 'background-color':
						/*
						 * 少写个_this找了20分钟...FK;
						 * 若颜色有关,使用parseColor对颜色值进行转换
						 */  
						_this.startStyles[style] = _this.parseColor(_this.getCurStyle(style));
						var temp =  _this.parseColor(styles[style]);
						/*
						 * @des: 通过目标样式和初始样式计算出颜色样式的中间差值
						 * @date: 2011.10.26 0:37
						 */  
						_this.endStyles[style] = [temp[0]-_this.startStyles[style][0],temp[1]-_this.startStyles[style][1],temp[2]-_this.startStyles[style][2]];
						break;
					default:
						_this.startStyles[style] = parseFloat(_this.getCurStyle(style));
						/*
						 * @des: 通过目标样式和初始样式计算出普通样式的中间差值
						 */  
						_this.endStyles[style] = parseFloat(styles[style]) - _this.startStyles[style] ;
						//测试可获得元素的动画开始样式组合动画终止样式组 2011.10.25 20:45
 						//alert(_this.getCurStyle(style));
						//alert(styles[style])
						/*
						*  @Version 1.01
						*  若动画终止样式与初始样式一致，停止动画执行，提升健壮性和性能。
						*/
						if(_this.endStyles[style] == 0){return false; _this.stop();}
				}
			}
		},//eOf getAnimateStyle
		
		/**
		 * formatStyleName {Function function}:将带有"-"的样式名称转换为骆驼型名称
		 * @param {String} 样式名称
		 * @return {String} 骆驼型样式名称
		 */ 
		 formatStyleName:function(str){
			if(str.indexOf("-")){
				var resArr = str.split("-");
				return resArr[0]+resArr[1][0].toUpperCase()+resArr[1].substring(1);
			}else{
				return str;
			}

		},//eOf formatStyleName
		
		/**
		 * getCurStyle {Function function}获取元素当前在浏览器中的样式
		 * @param {String} 样式名称
		 * @return {String} 骆驼型样式名称
		 */ 
		getCurStyle:function(prop){
			//缓存各个boss变量
			var _this = this.el,
			    doc = upper.document,
				view = doc.defaultView,
				//Sunny核心库的Browser对象，is可以根据浏览器内核判断当前浏览器类型
				brsr = Sunny.Browser.is();
			if(prop.indexOf("-")>0)prop = formatStyleName(prop);
			if(brsr!="MSIE"){
				//非IE处理方式
				return view.getComputedStyle(_this,"")[prop] || null;
			}else{
				//IE处理方式
				if(prop == 'opacity'){	
					var value = 100;
					try{
						value = _this.filters['DXImageTransform.Microsoft.Alpha'].opacity;
					}catch(e){
						try{
							value = _this.filters('alpha').opacity;
						}catch(e){}
					}
					value = isNaN(value) ? 100 : (value || 0);
					return value / 100;	
				}
				return _this.currentStyle[prop] || null;			
			}
		},//eOf getCurStyles
		
		/**
		 * setCurStyle {Function function}设置元素的某个样式（透明度，颜色，其他）
		 * @param {Object HTMLElement} 元素对象
		 * @param {String prop} 样式名称
		 * @param {String value} 样式值
		 * @date 2011.10.25 21:20
		 */ 
	    setCurStyle:function(el, prop, value){
			var _this = this;
			//对样式值进行初始化处理，如果样式值属于不应该小于0的样式中的一种，那么将该值置为0，数组除外（颜色值是数组）
			var value = !Sny.isArray(value) && value < 0 && _this.gtZero.hasOwnProperty(prop) ? 0 : value;
			switch(prop){
				case 'opacity':
					el.style.filter = "alpha(opacity=" + value * 100 + ")"; el.style.opacity = value <= 0 ? 0 :value;
					break;
				case 'color':
				case 'borderColor':
				case 'border-color':
				case 'backgroundColor':
				case 'background-color':
					el.style[prop] = 'rgb('+Math.floor(value[0])+','+Math.floor(value[1])+','+Math.floor(value[2])+')';
					break;
				default:
					el.style[prop] = value+"px";
			}
		},//eOf setCurStyle
		
		/**
		 * parseColor {Function function}解析颜色，将所有类型（#xxx,#xxxxxx,rgb(x,x,x)）的颜色转换为[xx,xx,xx]的格式方便做颜色值得计算
		 * @param {String prop} 颜色内容
		 * @return {Objec Array} 解析后的颜色值数组
		 */ 
		parseColor:function(str){
			//匹配颜色的正则表达式，并将匹配的值返回
			var hex6 = /^#(\w{2})(\w{2})(\w{2})$/, 
			    hex3 = (/^#(\w{1})(\w{1})(\w{1})$/), 
			    rgb = (/^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/);
			var color = str.match(hex6);
			if(color && color.length == 4){
				return [parseInt(color[1], 16), parseInt(color[2], 16), parseInt(color[3], 16)];
			}
			color = str.match(rgb);
			if(color && color.length == 4){
				return [parseInt(color[1], 10), parseInt(color[2], 10), parseInt(color[3], 10)];
			}
			color = str.match(hex3);
			if(color && color.length == 4){
				return [parseInt(color[1] + color[1], 16), parseInt(color[2] + color[2], 16), parseInt(color[3] + color[3], 16)];
			}
		},//eOf parseColor
		
		/**
		 * start {Function function}开始执行动画函数，通过逐帧计算的方式将
		 * @param {String prop} 颜色内容
		 * @return {Objec Array} 解析后的颜色值数组
		 * @date 2011.10.25 21:40
		 */ 
		start: function(){
			var _this = this,t = 0,d = parseInt(_this.duration/15);
			_this.getAnimateStyle(_this.el,_this.options);//初始化动画样式：修复大变小BUG
			_this.animating = true;
			_this.anmTimer = setInterval(function(){
				if(t <= (d)){
					for(var i in _this.endStyles){
						var twnRtn;
						//判断元素样式值是否是数组，主要来判断颜色值,并分开计算rgb的值 @date 22:32
						if(Sny.isArray(_this.endStyles[i])){
							twnRtn = [];
							for(var j = 0; j < _this.endStyles[i].length;j++){
								twnRtn[j] = _this.aniType(t,_this.startStyles[i][j],_this.endStyles[i][j],d);
							}
						}else{
						    twnRtn = _this.aniType(t,_this.startStyles[i],_this.endStyles[i],d);}
						/*
						 *  @@Version 1.01
						 *  @Bug:测试大变小无法渐变BUG @date:2011.10.26 15:13
						 *  @Des:测试发现并不是大变小无法渐变，而是最后一个函数的动画终值全部变为了0，所以无法渐变。
						 *  @Reason：动画队列在执行过程中无法准确获取当前样式，这种情况是由于动画实例对象加入队列时，已经初始化了好了元素的初始样式和最终样式，
						 *  所以不论中间执行多少次动画，每个动画的开始样式总是最初样式，于是产生了上述BUG。@date:15:24 
						 *  @Fix：将getAnimateStyle获取初始和最终样式的方法放在start方法中，在执行动画之前才获取样式。
						 */
						//console.log(i+" twnRtn: "+twnRtn+"; t:"+t+"; d:"+d+"; _this.startStyles[i]"+_this.startStyles[i]+"; _this.endStyles[i]"+_this.endStyles[i]);
						//console.log(twnRtn[0]+" "+twnRtn[1]+" "+twnRtn[2]);
						_this.setCurStyle(_this.el,i,twnRtn); 
					}
					t++;
				}else{
					_this.stop(upper);
				}
			},15);
		},//eOf start
		
		/**
		 * stop {Function function}停止动画执行：清空interval,释放各种内存，防止在IE中的内存泄露，并在全局对象中调用回调函数
		 * @param {HTMLElement object} 全局对象
		 * @date 2011.10.26 0:41
		 */ 
		stop: function(upper){
			var _this = this;
			_this.anmTimer && clearInterval(_this.anmTimer);
			/*for(var i in _this.endStyles){
				_this.setCurStyle(_this.el,i,_this.endStyles[i]);}*/
			_this.anmTimer = null;
			_this.animating = false;
			_this.el = null;//防止循环引用而产生内存泄露
			this.callback.call(_this);
		},
		
		/**
		 * isAnimating {Function function}判断动画是否正在执行过程中
		 * @return {Boolean} 正在执行的话值为true
		 */
		 isAnimating: function(){
			return this.animating;
		 },
		 
		/**
		 * animate {Function function}构建新的动画对象实例，并将该对象放入动画宿主对象的动画队列中，动画队列的重要组成部分
		 * @param {HTMLElement object} 新动画实例的元素属性
		 * @param {Object JSON} 新动画实例的动画内容
		 * @param {int|String} 新动画实例的动画持续时间
		 * @param {String} 新动画实例的动画类型
		 * @param {Function function} 新动画实例的回调函数
		 * @return {Sunny SunnyFX}返回动画宿主对象，便于方法连写
		 * @date 2011.10.26 6:12
		 */
        animate: function(el, options, duration, aniType, callback){
            var _this = this;
			this.qFX(New(SunnyFX,[
				"1.0",
				"周源",
				"2011.11",
				"动画实例对象"])
				.initAnimate(el, options, duration, aniType, callback));
			return _this;
		 },
		 
		/**
		 * qFX {Function function}构建动画队列，将animate构建的新动画对象实例放入动画宿主对象的动画队列中，若动画宿主对象的当前活动动画不存在，则直接执行动画队列中的第一个动画
		 * @param {Sunny SunnyFX} 要加入队列的新动画实例对象
		 * @date 2011.10.26 6:23
		 */
        qFX:function(fxInstance){
			var _this = this;
			//若动画宿主对象的当前活动动画不存在，则直接执行动画队列中的第一个动画
			if(!_this.activeFX){
				_this.qClFX(fxInstance);
				return _this;
			}
			//将animate构建的新动画对象实例放入动画宿主对象的动画队列中
            _this.queueFX.enqueue(fxInstance);
        },

		/**
		 * qClFX {Function function}调用动画队列中最前面的动画对象实例的start方法，开始该动画；并且修改其回调函数，指向队列的下一个动画实例
		 * @param {Sunny SunnyFX} 动画对象实例
		 * @date 2011.10.26 6:40
		 */
        qClFX:function(fxInstance){
			var activeFX = fxInstance,
			_this = this;
			if(activeFX){
				//缓存回调函数，否则会循环调用当前对象的回调函数，从而引发栈溢出 @date: 2011.10.26 7:32
				var callback = activeFX.callback; _this.activeFX = activeFX;
				activeFX.callback = function(){
					callback.call(activeFX);
					_this.qFXNxt();
				}
				activeFX.start();
			}
			
		},
		/**
		 * qFXNxt {Function function}删除动画宿主对象的当前活动对象，并将队列中的下一个动画对象弹出，执行。
		 * @date 2011.10.26 6:36
		 */
        qFXNxt:function(){
			var _this = this;
	        if(_this.activeFx){
				delete _this.activeFx;
			}
			var fxInstance = _this.queueFX.dequeue();
			if(fxInstance){
				_this.qClFX(fxInstance);
			}
		}
	});//eOf - Class SunnyFX
	
	var sfx = New(SunnyFX,["1.0","周源","2011.11","基于SunnyJS构建的动画组件"]);
    //测试是否继承成功 2011.10.25 17:00
    //alert("from Sunny-fx.js:"+sfx.isA)
	//alert("from Sunny-fx.js:"+sfx.getNode);
	
    sfx.initAnimate(sfx.getNode("box"),{width:200,height:200,backgroundColor:"#369",left:100,top:100,opacity:0.3},1000,"easeInOut",function(){alert("动画执行完毕")});
	//测试能否获取动画实例的元素属性的当前样式 2011.10.25 19:00
	//alert(sfx.getCurStyle("backgroundColor")+sfx.getCurStyle("opacity"));
	
	//测试动画开始样式组和终止样式组是否正常2011.10.25 20:26
	//for(var i in sfx.startStyles){alert(i)}
	
	//动画首次测试成功 噢耶！@date 2011.10.25 22:23
	//全部测试成功 @date 2011.10.26 0:39
	//sfx.start();
	
	//测试动画队列 @date 2011.10.26 1:36 @des 动画队列的功能设计，将动画队列功能分为加入动画队列和开始动画队列两部分。
	var sfxQueue = New(SunnyFX,["1.0","周源","2011.11","基于SunnyJS构建的动画组件"]);
	//测试动画队列 @date 2011.10.26 7:57 @des callBack函数引起的栈溢出，未知callBack函数:多写了一个sfxQueue.start()- -!;
	/*sfxQueue.animate(sfxQueue.getNode("box"),{width:200,height:200},1000,"easeInOut",function(){alert("动画执行完毕")})
	        .animate(sfxQueue.getNode("box"),{backgroundColor:"#369"},1000,"easeInOut",function(){alert("动画执行完毕")})
			.animate(sfxQueue.getNode("box"),{opacity:0.3},1000,"easeInOut",function(){alert("动画执行完毕")})
			.animate(sfxQueue.getNode("box"),{left:100,top:300},1000,"easeInOut",function(){alert("动画执行完毕")});*/
	
/*    Sny.getNode("go").onclick = showAni;
	
	function showAni(){
		var sfxQueue = New(SunnyFX,["1.0","周源","2011.11","基于SunnyJS构建的动画组件"]);
	    sfxQueue.animate(sfxQueue.getNode("box"),{width:200,height:200},1000,"easeInOut")
	        .animate(sfxQueue.getNode("box"),{backgroundColor:"#369"},1000,"easeInOut")
			.animate(sfxQueue.getNode("box"),{opacity:0.3},1000,"easeInOut")
			.animate(sfxQueue.getNode("box"),{left:200},1000,"bounceEaseOut")
			.animate(sfxQueue.getNode("box"),{top:300},1000,"elasticEaseOut");
	}*/
})(this);