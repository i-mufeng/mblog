---
description: 在一个较为复杂的继承链中，祖先类更具有一般性，作为派生其他类的基类而不糊将其作为用来构造实例。
categories: 
   - JAVA 学习笔记
tags: 
   - JAVA
   - OOP
outline: [2, 3]
---

# 抽象类和抽象方法

在一个较为复杂的继承链中，父类有可能只知道子类应当具备某个方法，但是不能够明确方法实现。祖先类更具有一般性。通常祖先类只会作为派生其他类的基类而不糊将其作为用来构造实例。如员工之于公司，每个员工都应该得到工资，但是每个员工的工资可能都不一样。所以员工类就会有一个没有方法主体的**抽象方法**。而包含抽象方法的类就是**抽象类**。

抽象类与抽象方法都用 `abstract` 关键字修饰。上述例子的实现可以如下：

```java
class Scratch {
    public static void main(String[] args) {
        var leader = new Leader();
        leader.setName("马云");
        leader.payoff(1000000000.00);
        
        var mufeng = new Staff();
        mufeng.setName("沐风");
        mufeng.payoff(1000.00);

    }

}
abstract class Employee {
    private String name;
    
    abstract void payoff(Double salary);

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}

class Leader extends Employee {
    @Override
    void payoff(Double salary) {
        System.out.printf("%s领导不发工资，本月收入%s\n", this.getName(), salary);
    }
}
class Staff extends Employee {
    @Override
    void payoff(Double salary) {
        System.out.printf("%s本月发工资%s\n", this.getName(), salary);
    }
}
```

在上述的例子中，Employee 类中 `payoff(Double salary)` 方法就是抽象方法，相应的，Employee 类也必须是抽象类。抽象类也可以有具体的属性和方法。



::: warning 说明：
- 抽象类不能实例化对象。
- 抽象类可以有构造方法，供子类创建时初始化。
- 成员变量可以定义在抽象类中。
- 抽象类的子类如果不重写抽象方法，则必须用 abstract 关键字修饰。
- 抽象方法不能被限制为 private 或 final。
:::
