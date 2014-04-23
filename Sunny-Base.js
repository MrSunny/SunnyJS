/**
 * @Des Sunny-Base.js 
 * 模拟基于类的面向对象方式编程基础库，可实现多重继承，在代码复用性、数据封装、各模块之间的数据交互上在理论上要强于一般函数式编程；
 * 在继承过程中不破坏原型链，保持prototype和constructor,有自己定制的判断实例原型的方法，可准确获取对象类型；
 * 所有实例对象共享类，父类以及所有祖先类得实例方法，降低内存消耗和代码量，提高性能，理论上比一般的基于原型链继承面向对象性能更好；
 * 非常易于扩展，基于Sunny-Base可以扩展任何你想实现的JS类库。
 * @Since 2011.10.27
 * @Author Mr.Zhou
 * @Version 1.01 DEBUG
 * @Copyright (c) 2011 Mr.Zhou
 * @Licensed under the MIT3.0 license.
 */
(function(upper){
    
	/**
	 * upper.Class -  Base Class 基类，面向对象方式构建JS对象，用于声明类及继承关系.
	 * @param {Function function} 基类
	 * @param {Object} 要构建的类对象，必须具有Create方法，该方法相当于类的构造函数
	 * @return {Object class_} 类对象
	 */
    upper.Class = function(aBaseClass, aClassDefine){ 
	    //创建类的临时函数壳 ，ps：用这个函数来中转原型链
        function class_(){ 
		     //我们给每一个类约定一个 Type属性，ps：引用其继承的类 ，实现显式访问原型链对象
            this.type = aBaseClass;   
            for(var member in aClassDefine) 
			    //复制类的全部定义到当前创建的类 ，ps：所有属性和对象，如果有私有的捏？
                this[member] = aClassDefine[member];    
        }; 
        class_.prototype = aBaseClass; 
        return new class_(); 
    }; 
     
	/**
	 * upper.New -  用于创建类实例
	 * @param {Function} 类对象
	 * @param {Array} 通过aClass的Create方法构建类实例时向Create方法中传递的参数列表
	 * @return {Object new_} 实例对象
	 */
    upper.New = function(aClass, aParams){   
        //创建对象的临时函数壳 ps：中转类构造函数逻辑和原型链
        function new_(){     
             //我们也给每一个对象约定一个 Type 属性，据此可以访问到对象所属的类 ps：留个指针，以后好找自己的类，跟反射有点儿像
            this.type = aClass;   
            if (aClass.Create) 
                 //调用类对象的构造函数
                aClass.Create.apply(this, aParams);  
        }; 
        new_.prototype = aClass; //ps：中转原型链
        return new new_(); //ps：构造实例对象，并将实例对象返回
    }; 
	
    /**
	 * object - 定义小写的 object 基本类，用于实现最基础的方法等，为SunnyJS库的上层接口
     */
    upper.object = object = { 
	    //上层接口
	    upper:upper,
	    /*
		 * 一个判断类与类之间以及对象与类之间关系的基础方法,在模式上类似于Object的toString,
		 * 这样所有继承了object基类的对象都将有isA方法。
		 * @DoSomething 该方法需要重写，以便于模块异步加载时处理依赖关系
	     */
        isA: function(type) {
            var self = this; 
			//循环判断函数和函数的type属性
			while(self){
                if (self == type) 
                  return true; 
                self = self.type;
            }; 
            return false; 
        },
		//各类通用工具函数接口，待实现
		tools:{},
		
		//Sunny库接口
		Sunny:null
    }; 
	
	/**
	 * Example: 创建类对象，继承object类
	 * @Class 创建Person类
	 * @param {object} 要继承的父类对象
	 * @param {object|json} 必须包含属性Create{function}，通过该Person类创建实例对象的构造函数
	 * @param {function|others} 实例方法，这些方法将被实例对象所共享，可以为任意数据类型，但建议为function。
	 */  
    var Person = Class(object,{
		/**
		 * Constructor:Person 基类构造函数
		 * @param {String} 姓名
		 * @param {int} 年龄
		 * @param {String|others} 爱好
		 */  
        Create: function(name, age, interest){
            this.name = name; 
            this.age = age; 
			this.interest = interest;
        }, 
        SayHello: function(){
         
            alert("Hello, I'm " + this.name + ", " + this.age + " years old.And i like"+this.interest); 
        } 
    }); 
	
	var zhou = New(Person, ["Mr.Zhou", 23,"Web Front and End."]); 
	//zhou.SayHello();
	//alert(zhou.isA)
	var Darrel = New(Person, ["文叔", 122,"Eat..sleep..."]); 
	//Darrel.SayHello();

})(this)