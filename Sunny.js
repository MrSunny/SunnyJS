/**
 * @Since 2011.10.25
 * @Author Mr.Zhou
 * @Des Sunny.js SunnyJS库总接口，提供各个组件的子接口
 * @Version 1.0 DEBUG
 * @Copyright (c) 2011 Mr.Zhou
 * @Licensed under the MIT3.0 license.
 */

(function(upper){
	
	/**
	 * init Sunny，缓存boss对象
	 */
	var object = upper.object,
	    doc = upper.document;
	/**
	 * {Object object} Sunny库核心基类
	 */
	upper.Sunny = Sunny = Class(object,{
		/**
		 * Create{Function function}:Sunny组件总接口构造函数
		 * @param {String|others} 版本
		 * @param {String|others} 作者
		 * @param {String|others} 日期
		 * @param {String|others} 类说明
		 */  
		//@dosomething 这里实际上还可以实现构造函数重载，否则继承够造函数时有局限性！
		Create:function(version,author,date,des){
		    this.version = version;
			this.author = author;
			this.date = date;
			this.des = des;
		},
		
		//上层接口
		parent:upper.object,
		
		//获取元素对象
		getNode:function(nodeName){
			return typeof nodeName == "string" ? doc.getElementById(nodeName) : nodeName;},
			
		//延迟加载模块接口
		DeferLoad:{},
		
		//ajax操作接口
		ajax:{},
		
        //队列控制基类
		Queue:Class(object,{
			/**
			 * Create {Function function}:队列控制组件，实现各类函数的队列控制
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
				this.items = [];
			},
			
			/**
			 * 新对象加入队列
			 * @param {Object} 压入队列的对象
			 */
			enqueue: function(item){
				this.items.push(item);
			},
			
			/**
			 * 返回队列最前面的元素
			 * @return {Object|Null} 队列对象或空对象
			 */
			dequeue: function(){
				var item = this.items.shift();
				return item ? item : null;
			},
			
			/**
			 * 判断队列是否为空
			 * @return {Boolean} 根据队列长度来判断队列是否为空
			 */
			isEmpty: function(){
				return this.items.length == 0;
			},
			
			/**
			 * 清空队列
			 */
			clear: function(){
				this.items = [];
			}
			
		}),//eOf Queue:Class
		
		//浏览器组件基类
		Browser:Class(object,{
					  
			/**
			 * Create {Function function}:浏览器组件，浏览器的各种功能接口及类方法。
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
			
			/**
			 * is {Function function}:根据浏览器内核判断浏览器类型
			 * @return {String} 浏览器内核类型
			 */ 
			is:function(){
				var uAgent = upper.navigator.userAgent;
				var bs = ["MSIE","Firefox","Safari","Camino","Gecko"];
				for(var i = 0;i<bs.length;i++){
					if(uAgent.indexOf(bs[i])>0){return bs[i]};
				}
			}
		}),//eOf Browser:Calss
		/**
		 * isArray {Function function}:判断参数对象是否是数组类型
		 * @return {Boolean} 若为数组则值为true
		 */ 
		isArray:function(obj){
			return Object.prototype.toString.call(obj).indexOf("Array") > 0;
		}
	});

	
	var oSny = New(Sunny,["1.0","周源","2011.11","基于Sunny-Base.js构建的Sunny库基础组件"]);
	//alert("from sunny.js: "+oSny.isA);
	var oQ = New(Sunny.Queue,["1.0","周源","2011.11","Sunny库基础组件队列控制对象"]);
	//alert(oQ.isEmpty)
	
	//浏览器组件类方法测试 2011.10.25
	//alert("from sunny.js - Sunny.Browser: "+Sunny.Browser.is())
})(this);