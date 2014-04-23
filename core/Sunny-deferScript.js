/**
 * @Des Sunny-deferLoad.js 
 * 	该模块有两种实现方式，可根据模块加载情况自行判断使用哪种加载模式：
 * 		1.基于SunnyJS库的延迟加载组件，继承Sunny类，基于类，依赖于Sunny类的队列控制实现。调用方式：Sunny.DeferLoad
 * 		2.不依赖与任何类或组件，可作为模块加载器独立使用，基于原型，耦合性低，具有更好的灵活性；
 * 		@DoSomething: 在Sunny框架中可以根据每个类的parent属性自动判断依赖关系，并加载所需模块。
 * @Since 2011.10.27 16:52
 * @Author Mr.Zhou
 * @Version 1.0 DEBUG
 * @Copyright (c) 2011 Mr.Zhou
 * @Licensed under the MIT3.0 license.
 */

(function(upper){
	
	/**
	 * init SunnyDFL，缓存boss对象
	 */
	var Sny = upper.Sunny,
		doc = upper.document;
	/**
	 * Sunny-deferLoad模块的第一种实现方式，继承自Sunny类，基于类构建。
	 */
	upper === window && upper.Sunny && upper.Sunny.isA(Sunny)?
		/**
		 * Sunny-deferLoad模块的第一种实现方式，继承自Sunny类，基于类构建。
		 */
		function(upper){
			var DeferLoad = Class(Sunny,{
				/**
				 * Create{Function function}:Sunny-deferScript组件基类构造函数
				 * @param {String|others} 版本
				 * @param {String|others} 作者
				 * @param {String|others} 日期
				 * @param {String|others} 类说明
				 */
				Create:function(version,author,date,des){
				    this.version = version;
					this.author = author;
					this.date = date;
					this.des = des;
				},
				load:load
			});
			upper.Sunny.DeferLoad = Sunny.DeferLoad = DeferLoad;
		}(upper)
    :function(upper){
		var DeferLoad = {
			load:load
		};
    	upper.DeferLoad = DeferLoad;
    }(upper);
    
	/**
	 * load {Function function}:模块加载函数，用于加载js或者css文件
	 * @param {String} js or css?
	 * @param {String} 文件路径
	 * @param {Function function} 回调函数
	 */ 
	function load(type,url,callback){
		var head = document.getElementsByTagName("head")[0],
	        callback = !!callback ? callback : function(){};//判断回调函数
		if(type === "js"){
			var isJS = true;
	        var script = createNode("script",{type:"text/javascript"});//创建script节点。
		}else if(type ==="css"){
			var isCSS = true;
			var css = createNode("link",{rel:"stylesheet",type:"text/css" ,charset: 'utf-8',href:url});
		}
		
		if(isJS){
	        if (script.readyState){//IE
	            script.onreadystatechange = function(){
	                if (script.readyState == "loaded" || script.readyState == "complete"){
	                    script.onreadystatechange = null;
	                    callback();
	                }
	            };
	        } else {  //Others
	            script.onload = function(){
	                callback();
	            };
	        }
	        script.src = url;
	        document.getElementsByTagName("head")[0].appendChild(script);
		}else if(isCSS){
			head.appendChild(css);
			callback();
		}
	}//eOf load
	
	/**
	 * createNode {Function function}:根据元素名称和属性列表创建元素对象
	 * @param {String} 元素标签名称
	 * @param {Object JSON} 元素属性键值对
	 * @return  {HTMLElement} 元素对象
	 */ 
	function createNode(name,attrs){
		var node = doc.createElement(name);
		for(attr in attrs){
			//if(node.hasOwnProperty(attr)){
				node.setAttribute(attr,attrs[attr]);
			//}
		}
		return node;
	}//eOf createNode
	
})(this);