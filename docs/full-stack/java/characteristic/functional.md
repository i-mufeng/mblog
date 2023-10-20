---
description: Lambda 表达式、Stream 流、Optional 类操作分享。
tags:
    - Java
category: JAVA 学习笔记
cover: false
---

# Java8 新特性详解

> Lambda 表达式、Stream 流、Optional 类操作分享。

## 一、Lambda表达式

Lambda表达式可以让你简洁的表示一个行为或传递代码。Lambda表达式可以理解为简洁的表示可传递匿名函数的一种方式：它没有名称，但是有参数列表、函数主体、返回类型

- **匿名：** 没有名称
- **函数：** Lambda函数不像方法那样属于特定的类。但是和方法一样，有参数列表、函数体以及返回类型 。也可以抛出异常。
- **传递：** Lambda表达式可以作为参数传递给方法或存储在变量中。
- **简介：** 无需像匿名类那样写很多模板代码。

**示例：**

```Java
// 不使用Lambda
Comparator<Apple> byWeight = new Comparator<Apple>(){
	public int compare(Apple a1, Apple a2){
		return a1.getWeidht().compareTo(a2.getWeight());
	}
}  

// 使用Lambda表达式
Comparator<Apple> byWeight = 
    (Apple a1, Apple a2) -> a1.getWeight().compareTo(a2.getWeight());
```

![img](https://cdn.imufeng.cn/imufeng/epub_26211813_42)

## 二、Stream流

> `Stream流` 是 Java8 提供对集合或数组进行链状流式操作的函数式编程模式。

###  2.1 中间操作

- **filter：** 过滤

- **map：** 计算或转换

- **distinct：** 去除重复对象（equals 方法）

- **sorted：** 排序，可以实现 Comparator 接口重写 compareTo 方法进行排序

- **limit：** 设置流的最大长度

- **skip：** 跳过前n个元素

- **flatMap：** 将一个对象转换为多个对象作为流中的元素

### 2.2 终结操作

::: danger 注意
如果没有终结操作，中间操作不会执行 
:::

#### 常规操作

- **forEach：** 遍历

- **count：** 计数

- **max&min：** 求最值 需要指定比较最大值的规则 返回 Optional

- **collect：** 将流转换为集合

#### 查找与匹配

-  **anyMatch：** 判断是否存在能够符合匹配条件的元素

-  **allMatch：** 判断是否全部匹配条件
-  **noneMatch：** 是否都不符合条件
-  **findAny：** 获取任意一个符合条件元素（不一定是第一个）
-  **findFirst：** 获取第一个符合条件的元素

#### reduce归并

对流中的数据按照你指定的计算方式计算出一个结果 （缩减操作）

```java
System.out.println(people.stream()
        .distinct()
        .map(People::getAge)
        .reduce(0, (o1, o2) -> o1 += o2));
System.out.println(people.stream()
        .distinct()
        .map(People::getAge)
        .reduce(0, Integer::sum));
```

```java
System.out.println(people.stream()
        .distinct()
        .map(People::getAge)
        .reduce(Integer.MIN_VALUE, Integer::max));
System.out.println(people.stream()
        .distinct()
        .map(People::getAge)
        .reduce(Integer.MAX_VALUE, Integer::min));
```

## 三、Optional

> 使用 Optional 可以写出更优雅的代码来避免空指针异常
>
> Optional 类似于包装类，将具体的数据封装到Optional对象内部。我们可以使用Optional中封装好的方法操作封装的数据。优雅的避免空指针异常

### 创建对象

`ofNullAble()` 方法会将其封装为一个Optional对象

```java
People people = new People();
Optional<People> people1 = Optional.ofNullable(people);
```

如果能够保证传入的对象非空，则可以使用of()方法封装

```java
People people = new People();
people.setName("mufeng");
people.setAge(13);
Optional<People> people1 = Optional.of(people);
```

如果需要一个空值，使用 emepy() 方法

### 安全获取值

`orElseGet()`	如果非空则返回，如果为空则给默认值

`orElseThrow()` 获取数据，为空则抛出异常

### 其他方法

`filter()` 类似于Stream流中的filter方法

`isPeresent（）` 进行是否存在值的判断（更推荐使用`ifPeresent()`方法）

`map()` 数据转换。类似于Stream流中的map方法

## 四、函数式接口

> **只有一个抽象方法的接口称为函数式接口**
>
> JDK的函数式接口都加上了`@FunctionalInterface`进行标识。但是加不加都无所谓。

### 常用的函数式接口

`Consumer`	消费接口

`Function`	计算转换接口

`Predicate`	判断接口

`Supplier`	生产型接口

### 常用的默认方法

`and`	判断条件的并集

`or`	判断条件的交集

`negate`	判断条件取反

### 方法引用

`类名/对象名::方法名`

