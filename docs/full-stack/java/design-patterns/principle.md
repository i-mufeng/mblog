---
description: 设计模式有七大原则，它体现的是开发过程中的优雅，是一种艺术。遵循这些原则，就能写出更加优雅、灵活的代码结构。
categories: 
   - JAVA 学习笔记
tags: 
   - JAVA
   - 设计模式
outline: [2, 3]
cover: https://cdn.imufeng.cn/mblog/0c82b8f471f9e4337d0131afb5a71515.png
head:
  - - meta
    - name: keywords
      content: java, 设计模式, 设计模式原则, 单一职责原则, 开放-封闭原则, 里氏替换原则, 依赖倒置原则, 接口隔离原则, 迪米特法则, 合成复用原则
---

# 设计模式七大原则

## 一、简介

设计模式一般遵循七种原则：

1. 单一职责原则 (Single Responsibility Principle)
2. 开放-封闭原则 (Open-Closed Principle)
3. 里氏替换原则 (Liskov Substitution Principle)
4. 依赖倒置原则 (Dependence Inversion Principle)
5. 接口隔离原则 (Interface Segregation Principle)
6. 迪米特法则（Law Of Demeter）
7. 组合/合成复用原则 (Composite/Aggregate Reuse Principle)

这些原则首字母可以组合成 `SOLID` （稳定的），代表遵循这些原则就可以建立稳定、灵活、健壮的系统。

## 二、单一职责原则

单一职责原则 （Single Responsibility Principle，SRP）指一个类应该只有一个引起变化的原因，即一个类（Class/Interface/Method）应该只负责一项职责。

### 核心思想

Class / Interface / Method 应该只负责一项职责

### 优点

遵循该原则，可以降低类的复杂度，提高类的可读性、可维护性，降低变更风险。修改一个功能时可以以显著降低对其他功能的影响。

### 实例

以下员工类是一个违反单一职责原则的例子：

```java
class Employee {
    private String name;
    private String employeeId;
    private double salary;

    // 计算工资的方法
    public double calculateSalary() {
        // 计算工资的逻辑
        return salary;
    }

    // 存储员工信息的方法
    public void saveEmployee() {
        // 存储员工信息的逻辑
    }
}
```

在上面的例子中，`Employee` 类同时负责两个职责：计算工资和存储员工信息。这违反了单一职责原则，因为一个类应该只负责一个单一的功能。为了遵循单一职责原则，我们可以将这两个职责分开成两个类：

```java
// 员工信息类，负责存储员工信息
class Employee {
    private String name;
    private String employeeId;
}

// 计算工资类，负责计算员工工资
class SalaryCalculator {
    // 计算工资的方法
    public double calculateSalary(Employee employee) {
        // 计算工资的逻辑
        return employee.getSalary();
    }
}
```

在这个修正后的例子中，`Employee` 类负责存储员工信息，而 `SalaryCalculator` 类负责计算员工的工资。

## 三、开放-封闭原则

开放封闭原则（Open-Closed Principle, OCP）简称开闭原则，指软件实体（类、模块、函数等）应该对拓展开放，对修改关闭。可以通过添加新的代码来扩展系统的功能，而不是修改已有的代码。

### 核心思想

抽象，面向抽象编程。

### 优点

可以提高代码的可复用性和可维护性。对于已有的软件系统，可以很快的进行拓展，不需要修改其底层。

### 实例

假设有一个应用程序，用于处理不同类型的形状（如圆形、矩形等），并计算它们的面积。现在我们希望向应用程序添加一个新的形状：三角形。

首先，我们定义一个抽象的形状接口 `Shape`：

```java
// 形状接口
interface Shape {
    double calculateArea();
}
```

然后，我们创建具体的形状类，如圆形（`Circle`）和矩形（`Rectangle`），并实现 `Shape` 接口：

```java
// 圆形类
class Circle implements Shape {
    private double radius;

    public Circle(double radius) {
        this.radius = radius;
    }

    @Override
    public double calculateArea() {
        return Math.PI * radius * radius;
    }
}

// 矩形类
class Rectangle implements Shape {
    private double width;
    private double height;

    public Rectangle(double width, double height) {
        this.width = width;
        this.height = height;
    }

    @Override
    public double calculateArea() {
        return width * height;
    }
}
```

现在，我们想要添加一个新的形状：三角形。我们不需要修改已有的 `Circle` 和 `Rectangle` 类，而是创建一个新的类 `Triangle`，并实现 `Shape` 接口：

```java
// 三角形类
class Triangle implements Shape {
    private double base;
    private double height;

    public Triangle(double base, double height) {
        this.base = base;
        this.height = height;
    }

    @Override
    public double calculateArea() {
        return 0.5 * base * height;
    }
}
```

通过这种方式，我们通过扩展而不是修改现有的代码来添加新的功能，遵循了开放封闭原则。现有的代码对于新增的 `Triangle` 类是关闭的，但对于新增形状的扩展是开放的。

## 四、里氏替换原则

里氏替换原则（Liskov Substitution Principle，LSP）是指子类对象应该能够替换掉父类对象并且不影响程序的正确性。即父类能出现的地方子类也能出现，而且替换为子类也不会产生任何异常或错误。

子类可以拓展父类的功能，但是不能覆写父类已有的功能。

### 核心思想

使用的基类可以在任何地方使用继承的子类，完美的替换基类。

### 优点

里氏替换原则可以约束继承的泛滥，是开闭原则的一种体现，也是开闭原则实现的重要方式之一。可以加强程序的健壮性，减少可能存在的错误。

### 实例

假设有一个图形类 `Shape`，它有一个 `getArea()` 方法用于计算图形的面积，并有两个子类 `Rectangle` 和 `Square`，分别表示矩形和正方形。按照里氏替换原则，正方形应该是矩形的子类，因为正方形是一种特殊的矩形，但是需要注意的是，在实现过程中，如果强行让 `Square` 继承自 `Rectangle` 可能会违反里氏替换原则，因为正方形和矩形在某些方面有不同的行为。

```java
// 形状类
class Shape {
    public double getArea() {
        return 0;
    }
}
```

```java
// 矩形类
class Rectangle extends Shape {
    private double width;
    private double height;

    public Rectangle(double width, double height) {
        this.width = width;
        this.height = height;
    }

    @Override
    public double getArea() {
        return width * height;
    }
}
```

```java
// 正方形类
class Square extends Shape {
    private double side;

    public Square(double side) {
        this.side = side;
    }

    @Override
    public double getArea() {
        return side * side;
    }
}
```

在这个例子中，`Square` 类继承自 `Shape`，并实现了 `getArea()` 方法来计算正方形的面积。尽管正方形也可以视作是一种特殊的矩形，但是如果 `Square` 类继承自 `Rectangle`，则可能会违反里氏替换原则，因为对于矩形类来说，修改宽度可能会导致高度也被修改，但对于正方形来说这是不合理的。因此，要遵循里氏替换原则，我们应该保持 `Square` 和 `Rectangle` 作为各自独立的类，它们都继承自 `Shape`，但彼此之间不应该有继承关系。

## 五、依赖倒置原则 

依赖倒置原则（Dependence Inversion Principle,DIP）是指高层模块不应该依赖于低层模块，二者都应该依赖于抽象；抽象不应该依赖于具体实现细节，具体实现细节应该依赖于抽象。

在设计软件系统模块时，应该通过接口或抽象类来定义模块之间的通信方式，而不是直接依赖于具体的实现类。

### 核心思想

面向接口编程，不要面向实现编程。

### 优点

依赖倒置原则可以降低类与类之间的耦合性，提高系统稳定性及代码的可阅读性、可维护性。

### 实例

假设有一个电子邮件发送器（`EmailSender`）和一个短信发送器（`SMSSender`），它们都负责发送通知给用户。原始的设计可能会让高层模块直接依赖于具体的发送器实现，但是通过应用依赖倒置原则，我们可以通过引入一个抽象的通知发送器接口来解耦高层模块和具体的发送器实现。

```java
// 通知发送器接口
interface NotificationSender {
    void sendNotification(String message);
}

// 电子邮件发送器实现
class EmailSender implements NotificationSender {
    @Override
    public void sendNotification(String message) {
        // 实现电子邮件发送逻辑
        System.out.println("Sending email: " + message);
    }
}

// 短信发送器实现
class SMSSender implements NotificationSender {
    @Override
    public void sendNotification(String message) {
        // 实现短信发送逻辑
        System.out.println("Sending SMS: " + message);
    }
}

// 高层模块，依赖于抽象的通知发送器接口
class NotificationService {
    private NotificationSender sender;

    public NotificationService(NotificationSender sender) {
        this.sender = sender;
    }

    public void sendNotification(String message) {
        sender.sendNotification(message);
    }
}
```

在这个例子中，`NotificationService` 是高层模块，它不直接依赖于具体的发送器实现，而是依赖于抽象的 `NotificationSender` 接口。这样，如果以后需要新增其他类型的通知发送器，比如微信发送器或者推送通知发送器，只需实现 `NotificationSender` 接口即可，而不需要修改 `NotificationService` 类。这样就遵循了依赖倒置原则，实现了模块之间的解耦和可扩展性。

## 六、接口隔离原则

接口隔离原则（Interface Segregation Principle, ISP）要求客户端不应该被迫依赖于它们不使用的接口。一个类对另一个类的依赖应该建立在最小的接口上。

### 核心思想

高内聚低耦合

### 优点

遵循接口隔离原则可以降低系统的耦合性，将臃肿的接口分解为小粒度的接口，还可以预防外来变更的扩散，提高系统的灵活性、可拓展性、可维护性。

### 实例

假设有一个图形编辑器，它可以绘制不同类型的图形（如圆形、矩形、三角形等），并且可以执行一些其他的操作（如移动、缩放、删除等）。我们可以根据不同类型的操作定义不同的接口，以便客户端只需依赖于它们需要使用的接口。

```
// 绘图接口
interface Drawable {
    void draw();
}

// 移动操作接口
interface Movable {
    void move(int x, int y);
}

// 缩放操作接口
interface Scalable {
    void scale(double factor);
}

// 删除操作接口
interface Deletable {
    void delete();
}
```

```java
// 圆形类
class Circle implements Drawable, Movable, Scalable, Deletable {
    // 实现接口方法
    @Override
    public void draw() {
        System.out.println("Drawing a circle");
    }

    @Override
    public void move(int x, int y) {
        System.out.println("Moving the circle to (" + x + ", " + y + ")");
    }

    @Override
    public void scale(double factor) {
        System.out.println("Scaling the circle by " + factor);
    }

    @Override
    public void delete() {
        System.out.println("Deleting the circle");
    }
}
```

```java
// 矩形类
class Rectangle implements Drawable, Movable, Scalable, Deletable {
    // 实现接口方法
    @Override
    public void draw() {
        System.out.println("Drawing a rectangle");
    }

    @Override
    public void move(int x, int y) {
        System.out.println("Moving the rectangle to (" + x + ", " + y + ")");
    }

    @Override
    public void scale(double factor) {
        System.out.println("Scaling the rectangle by " + factor);
    }

    @Override
    public void delete() {
        System.out.println("Deleting the rectangle");
    }
}
```

在这个例子中，每个图形类都实现了绘制、移动、缩放和删除这些操作的接口，但是客户端只需要依赖于它们需要使用的接口。例如，如果客户端只需要绘制图形，则只需依赖于 `Drawable` 接口，而不需要依赖于其他操作的接口，这样就避免了客户端对于不需要的接口的依赖，符合接口隔离原则。

## 七、迪米特法则

迪米特法则（Law of Demeter LoD）又叫最少知道原则（Least Knowledge Principle,LKP），是指一个对象应该对其他对象保持最少的了解，尽量降低类与类之间的耦合。

### 核心思想

一个对象不应该直接与其他对象进行过多的交互，而应该通过尽可能少的中介对象来完成。

### 优点

迪米特法则提高了模块间的相对独立性，降低类之间的耦合度。更提高了类的可复用性和系统的可拓展性。

### 实例

假设有一个班级（`Class`）和学生（`Student`）的系统，班级包含了一组学生，并且可以打印出每个学生的信息。按照迪米特法则，班级不应该直接访问学生的信息，而是应该通过学生对象自己来获取信息。

```java
import java.util.ArrayList;
import java.util.List;

// 学生类
class Student {
    private String name;
    private int age;

    public Student(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String getName() {
        return name;
    }

    public int getAge() {
        return age;
    }
}
```

```java
// 班级类
class Class {
    private List<Student> students;

    public Class() {
        this.students = new ArrayList<>();
    }

    // 添加学生到班级
    public void addStudent(Student student) {
        students.add(student);
    }

    // 打印班级信息，不需要直接访问学生信息
    public void printClassInfo() {
        for (Student student : students) {
            System.out.println("Student name: " + student.getName() + ", age: " + student.getAge());
        }
    }
}
```

```java
// 客户端代码
public class Main {
    public static void main(String[] args) {
        Class class1 = new Class();
        class1.addStudent(new Student("Alice", 20));
        class1.addStudent(new Student("Bob", 21));

        // 客户端只需要调用班级类的方法，而不需要直接访问学生对象的信息
        class1.printClassInfo();
    }
}
```

在这个例子中，班级类 `Class` 不直接访问学生对象的信息，而是通过调用学生对象的 `getName()` 和 `getAge()` 方法来获取信息。这样，学生对象的信息对于班级类来说是隐藏的，符合迪米特法则。

## 八、合成复用原则

合成复用原则（Composite/Aggregate Reuse Principle,CARP）要求在软件设计中应该尽量使用对象组合(`has-a`)、聚合(`contanis-a`)，而不是继承关系达到软件复用的目的。

### 核心思想

尽量使用聚合、组合的方式，而不是使用继承。

### 优点

新旧类之间的耦合度低，维持了类的封装性，且提高了服用的灵活性。

### 实例

假设有一个飞行器类 `Aircraft`，它具有飞行的功能。现在我们要创建一个新的类 `Airplane`，它不仅能飞行，还能发射导弹。根据合成复用原则，我们应该通过组合的方式来实现 `Airplane` 类，而不是通过继承 `Aircraft` 类。

```java
// 飞行器类
class Aircraft {
    public void fly() {
        System.out.println("Aircraft is flying");
    }
}
```

```java
// 导弹发射器类
class MissileLauncher {
    public void launchMissile() {
        System.out.println("Missile is launched");
    }
}
```

```java
// 飞机类，通过组合方式实现复用
class Airplane {
    private Aircraft aircraft;
    private MissileLauncher missileLauncher;

    public Airplane() {
        this.aircraft = new Aircraft();
        this.missileLauncher = new MissileLauncher();
    }

    // 飞机具有飞行功能
    public void fly() {
        aircraft.fly();
    }

    // 飞机具有发射导弹功能
    public void launchMissile() {
        missileLauncher.launchMissile();
    }
}
```

```java
// 客户端代码
public class Main {
    public static void main(String[] args) {
        Airplane airplane = new Airplane();
        airplane.fly(); // 飞机飞行
        airplane.launchMissile(); // 飞机发射导弹
    }
}
```

在这个例子中，`Airplane` 类通过组合方式包含了 `Aircraft` 类和 `MissileLauncher` 类，从而实现了代码复用。这样做的好处是 `Airplane` 类不会继承不需要的飞行器或导弹发射器的功能，而是只包含所需的功能。这样的设计更加灵活和可维护，符合合成复用原则。

## 设计模式原则的总结

上边介绍的七种设计模式原则，是软件开发过程中需要遵守的原则，它们的侧重点各不相同。在实际开发过程中，必须是各种原则相结合，再充分考虑开发难度、成本等因素，平衡取舍，尽量设计更加优雅的代码。
