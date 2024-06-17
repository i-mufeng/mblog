---
top: 1
title: CSS 复习
sticky: 10
categories:
  - CSS 复习
outline: [ 2,3 ]
date: 2024-06-17
tags:
  - CSS
head:
  - - meta
    - name: keywords
      content: CSS，前端，样式
---

# css复习

## 1、选择器

`优先级`:

1、!important；

2、行内样式；

3、ID选择器；

4、类选择器；

5、标签选择器；

6、通配符选择器；

7、浏览器的自定义属性和继承。

> 用到多个后代样式时，优先级的情况：
>
> 1、 id个数多的优先级高；
>
> 2、id和class个数相等看元素个数；
>
> 3、优先级相同看选择器类型和个数。

**后代选择器**： （后代包括子、孙、重孙...）选择器与选择器之间用空格隔开

**子代选择器**：父选择器与子选择器之前用>隔开

**并集选择器**：每组选择器之间通过逗号隔开

**交集选择器**：选择器之间是紧挨着的，没有东西分隔；如果有标签选择器，`标签选择器必须写在最前面`

**伪类选择器**：选择器：hover{css}

```html
<p class="highlight">这是一个段落。</p>  
    <p>这是另一个段落。</p>  
  
    <div>  
        <p>这是div内的段落。</p>  
        <p>这是div内的另一个段落。</p>  
    </div>  
  
    <input type="text" value="文本输入框">  
  
    <p id="unique">这是一个唯一的段落。</p>  
  
    <a href="#">链接</a>  
  
    <h2>标题</h2>  
    <p>这是一个与标题相邻的段落。</p>  
    <p>这是另一个与标题同级的段落。</p>  
    <span>这是一个span元素。</span>  
<style>
/* 类型选择器 */  
p {  
  color: blue;  
}  
/* 类选择器 */  
.highlight {  
   background-color: yellow;  
}  
/* ID 选择器 */  
#unique {  
   font-size: 20px;  
}  
/* 属性选择器 */  
input[type="text"] {  
   border: 1px solid green;  
}  
/* 后代选择器 */  
div p {  
   text-decoration: underline;  
}  
/* 子代选择器 */  
div > p {  
   font-style: italic;  
}  
/* 伪类选择器 */  
a:hover {  
   color: red;  
}  
/* 伪元素选择器 */  
p::first-line {  
    font-weight: bold;  
}  
/* 组合选择器 (多个选择器用逗号分隔) */  
p, span {  
     margin: 10px 0;  
}  
/* 相邻兄弟选择器 */  
h2 + p {  
   color: purple;  
}  
/* 通用兄弟选择器 */  
h2 ~ p {  
   text-indent: 2em;  
}  
</style>
```

## 2、背景

`background-color：rgb/rgba/十六进制/关键字`：背景颜色

`background-image：url(图片路径)`：背景图片

> 背景图片默认是在水平和垂直方向平铺；
>
> 背景图片仅仅是指给盒子起到装饰效果，类似于背景颜色，是不能撑开盒子的

`background-repeat: repeat/no-repeat/repeat-x/repeat-y`：背景平铺

> repeat：（默认值）水平和垂直方向平铺
>
> no-repeat：不平铺
>
> repeat-x：沿水平方向平铺
>
> repeat-y：沿重置方向平铺

`background-position：属性值`：背景位置

> 属性值：
>
> **一个值**：center、top、left、bottom、right、数值或百分比（指定相对于左边界的 x 坐标，y 坐标被设置成 相应的像素值或者百分比）
>
> **两个值**：第一个值是水平方向，第二个是垂直方向
>
> 如果第一个值是left或者right，第二个值是数值或者百分比，则该属性的表达的是：相对于顶部边界的 Y；
>
> 如果第一个值是top或者bottom，第二个值是数值或者百分比，则该属性的表达的是：相对于顶部边界的 X；
>
> **三个值**：两个值是关键字值，第三个是前面值的偏移量
>
> 第一个值只能是关键字；
>
> 数值或者百分比在第二个表示是第一个值的偏移量，在第三个表示第二个值的偏移量；
>
> 第二个和第三个都是数值或者百分比无效
>
> **四个值**：一、三为关键字，二、四为偏移量

也可以把这些属性写在一起：`background:color image repeat position`

## 3、定位position

### 绝对定位：position:absolute

需要配合方位属性（left、top、right、bottom）进行移动；

在页面中不占有原来的位置；

先找已经定位的父级，父级相对定位；子级绝对定位，若是没有父级，那就按照浏览器界面作为参照物；

改变标签的显示模式特点；

### 相对定位：position:relative

需要配合方位属性（left、top、right、bottom）进行移动；

`在页面中占有原来的位置`；

仍然具有标签原有的显示模式特点；

改变位置是参照之前的位置进行改变的；

### 固定定位：position:fixed

需要配合方位属性（left、top、right、bottom）进行移动；

在页面中不占有原来的位置；

## 4、对齐

### 1. 文本对齐

- `text-align`：用于设置块级元素中文本的水平对齐方式。
    - `text-align: left;`：左对齐。
    - `text-align: right;`：右对齐。
    - `text-align: center;`：居中对齐。
    - `text-align: justify;`：两端对齐。

### 2. 垂直对齐（内联元素和表格单元格）

- `vertical-align`：用于设置内联元素的垂直对齐方式。
    - `vertical-align: top;`：顶部对齐。
    - `vertical-align: bottom;`：底部对齐。
    - `vertical-align: middle;`：居中对齐。
    - `vertical-align: baseline;`：基线对齐（默认值）。

### 3. 块级元素水平居中

- `margin`：

  通过设置左右外边距为`auto`可以实现块级元素在容器中水平居中。

    - `margin-left: auto;`

    - `margin-right: auto;`

      > 注意：块级元素需要有一个指定的宽度。

### 4. Flexbox 对齐

Flexbox 是一个一维布局模型，适用于在容器内对齐和分布空间，即使容器大小动态变化或者未知。

- `justify-content`

  ：用于设置主轴（默认是水平方向）上的对齐方式。

    - `justify-content: flex-start;`
    - `justify-content: flex-end;`
    - `justify-content: center;`
    - `justify-content: space-between;`
    - `justify-content: space-around;`
    - `justify-content: space-evenly;`

- `align-items`

  ：用于设置交叉轴（默认是垂直方向）上的对齐方式。

    - `align-items: stretch;`
    - `align-items: flex-start;`
    - `align-items: flex-end;`
    - `align-items: center;`
    - `align-items: baseline;`

- **`align-self`**：允许单个 flex 项目有不同于其他项目的对齐方式。

### 5. Grid 对齐

Grid 是一个二维布局系统，适用于网页上的复杂布局设计。

- **`justify-items`**、**`align-items`**：分别控制网格内所有单元格在行轴和列轴上的对齐方式。
- **`justify-self`**、**`align-self`**：分别控制单个网格项目在行轴和列轴上的对齐方式。
- **`justify-content`**、**`align-content`**：控制网格容器内的行和列的对齐方式（当有多余空间时）。

### 6. 其他方式

- **`line-height`**：对于单行文本，可以通过设置与容器高度相等的行高来实现文本的垂直居中。
- **`display: table-cell;`**：通过模拟表格单元格的行为，可以使用 `vertical-align` 属性来垂直对齐元素。
- **`position` 与 `transform`**：结合使用 `position: absolute;` 或 `position: relative;` 以及 `transform: translateX(-50%);` 和 `transform: translateY(-50%);` 可以实现元素的水平和垂直居中。

## 5、隐藏overflow

- **visible**：默认值。内容不会被修剪，会呈现在元素框之外。
- **hidden**：内容会被修剪，并且其余内容是不可见的。
- **scroll**：内容会被修剪，但浏览器会显示滚动条以便查看其余的内容。
- **auto**：如果内容被修剪，则浏览器会显示滚动条以便查看其余的内容。
- **inherit**：从父元素继承 `overflow` 的值。

常用场景：

**文本超出隐藏**：

```css
.ellipsis {  
  /* 确保容器有一个明确的大小，以便文本可以溢出 */  
  width: 200px; /* 或者其他你需要的宽度 */  
  /* 隐藏溢出的文本 */  
  overflow: hidden;  
  /* 防止文本换行 */  
  white-space: nowrap;  
  /* 在文本被裁剪的地方显示省略号 */  
  text-overflow: ellipsis;  
}
```

**清除浮动：**

```css
<div class="parent">
    <div class="child"></div>
    <div class="child"></div>
</div>
.parent {
    border: 5px solid red;
    width: 300px;
}

.child {
    border: 5px solid blue;
    width:100px;
    height: 100px;
    float: left;
}
```

**内容滚动：**

```css
div 
{
	background-color:#00FFFF;
	width:150px;
	height:150px;
   /* 宽度超出150px横向滚动；高度超出150px纵向滚动 */
	overflow:scroll;
}
```

## 6、实现loading动画

```css
<svg class="loading" viewbox="25 25 50 50">
  <circle cx="50" cy="50" r="25" class="path" fill="none" />
</svg>
.loading {
  width: 50px;
  height: 50px;
  animation: rotate 2s linear 0s infinite;
}
.path {
  animation: dash 2s ease-in-out infinite;
  stroke: #00b390;
  stroke-width: 2;
  stroke-dasharray: 90 150;
  stroke-dashoffset: 0;
  stroke-linecap: round;
}
 
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
 
@keyframes dash {
  0% {
    stroke-dasharray: 1 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90 150;
    stroke-dashoffset: -40px;
  }
  100% {
    stroke-dasharray: 90 150;
    stroke-dashoffset: -120px;
  }
}
```

## 8、总结

首先想到的一个问题就是：***你做前端是有多少时间花在写css上？***

我的回答是非常多，几乎会用掉30%左右的时间去写css。虽然现在开发系统都会搭配使用ui组件库，这些组件库的组件能够使写让我们写css的时间大大的缩减，但是它也有他的弊端：每个组件库都有其自己的风格，它不一定能够满足你当前页面的设计需要。

虽然前端开发不要求我们要像那些大神一样，能够纯用css画出各种图案，但是最常用的一些写法（比如布局、超出隐藏、图片等比缩放、简单常用的动画效果等等）我们还是要熟练使用，这能够大大提高我们开发的效率。
