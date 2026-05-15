---
title: 红黑树原理与实现
description: 深入理解红黑树的性质、旋转操作和插入删除算法
categories:
  - 技术笔记分享
tags:
  - 数据结构
  - 红黑树
  - 算法
  - 树结构
outline: [2,3]
date: 2025-05-22
---

# 红黑树原理与实现

> 红黑树是一种自平衡的二叉搜索树，它通过颜色标记和旋转操作保证树的高度平衡，广泛应用于 Java 集合框架和 Linux 内核。

<!-- more -->

## 一、为什么需要红黑树

### 1.1 二叉搜索树的问题

普通的二叉搜索树（BST）在极端情况下会退化为链表：

```
正常 BST:          退化的 BST (插入有序数据):
    5                    1
   / \                    \
  3   7                    2
 / \   \                    \
1   4   9                    3
                              \
                               4
                                \
                                 5

查找时间: O(log n)    查找时间: O(n)
```

### 1.2 平衡二叉树的需求

我们需要一种数据结构：
- 保持二叉搜索树的性质
- 自动维持平衡
- 插入、删除、查找都是 O(log n)

### 1.3 红黑树 vs AVL 树

| 对比项 | 红黑树 | AVL 树 |
|--------|--------|--------|
| 平衡性 | 近似平衡 | 严格平衡 |
| 查找 | O(log n) | O(log n) |
| 插入 | O(log n)，最多2次旋转 | O(log n)，最多2次旋转 |
| 删除 | O(log n)，最多3次旋转 | O(log n)，最多 O(log n) 次旋转 |
| 应用 | Java HashMap、Linux 进程调度 | 数据库索引 |

:::tip 选择建议
- 插入删除频繁 → 红黑树
- 查找频繁、插入删除少 → AVL 树
:::

## 二、红黑树的五个性质

### 2.1 性质定义

```
1. 每个节点是红色或黑色
2. 根节点是黑色
3. 每个叶子节点（NIL）是黑色
4. 如果一个节点是红色，则它的两个子节点都是黑色
5. 从任一节点到其每个叶子的所有路径都包含相同数目的黑色节点
```

### 2.2 性质图示

```
         B (黑)
        / \
       R   R (红)
      / \   \
     B   B   B (黑)
    /         \
   NIL         NIL (黑叶子)

性质1: 每个节点非红即黑 ✓
性质2: 根节点是黑色 ✓
性质3: NIL 叶子是黑色 ✓
性质4: 红色节点的子节点都是黑色 ✓
性质5: 每条路径的黑色节点数相同 (都是2) ✓
```

### 2.3 性质的意义

**性质4 + 性质5 → 最长路径 ≤ 2 × 最短路径**

- 最短路径：全是黑色节点
- 最长路径：红黑交替
- 这保证了树的高度是 O(log n)

## 三、左旋与右旋操作

### 3.1 左旋（Left Rotate）

```
左旋前:          左旋后:
    x                y
   / \              / \
  a   y            x   c
     / \          / \
    b   c        a   b

y 成为新的根，x 成为 y 的左子树，y 的左子树 b 成为 x 的右子树
```

```java
private void leftRotate(Node x) {
    Node y = x.right;
    
    // 将 y 的左子树变为 x 的右子树
    x.right = y.left;
    if (y.left != null) {
        y.left.parent = x;
    }
    
    // 更新 y 的父节点
    y.parent = x.parent;
    if (x.parent == null) {
        root = y;
    } else if (x == x.parent.left) {
        x.parent.left = y;
    } else {
        x.parent.right = y;
    }
    
    // 将 x 设为 y 的左子树
    y.left = x;
    x.parent = y;
}
```

### 3.2 右旋（Right Rotate）

```
右旋前:          右旋后:
    y                x
   / \              / \
  x   c            a   y
 / \                  / \
a   b                b   c
```

```java
private void rightRotate(Node y) {
    Node x = y.left;
    
    y.left = x.right;
    if (x.right != null) {
        x.right.parent = y;
    }
    
    x.parent = y.parent;
    if (y.parent == null) {
        root = x;
    } else if (y == y.parent.left) {
        y.parent.left = x;
    } else {
        y.parent.right = x;
    }
    
    x.right = y;
    y.parent = x;
}
```

### 3.3 旋转的性质保持

旋转操作只改变节点的父子关系，不改变：
- 二叉搜索树的性质（中序遍历顺序不变）
- 黑色节点的数量
- 路径上的黑色节点数

## 四、插入操作与修复

### 4.1 插入步骤

1. 按照 BST 的方式插入新节点
2. 新节点着色为红色
3. 修复红黑树性质（可能违反性质4）

### 4.2 插入修复的三种情况

**情况1：叔叔节点是红色**

```
插入前:              插入 z 后:           修复后:
    G(黑)                G(黑)              G(红)
   / \                  / \                / \
  U(红) P(红)          U(红) P(红)        U(黑) P(黑)
       /                    /                    /
      ?                    z(红)                z(红)

处理: 父亲和叔叔变黑，祖父变红，继续向上检查
```

**情况2：叔叔是黑色，z 是右孩子**

```
插入前:              先左旋:              变成情况3:
    G(黑)                G(黑)                G(黑)
   / \                  / \                  / \
  U(黑) P(红)          U(黑) z(红)          U(黑) P(红)
       /                    /                      \
      z(红)                P(红)                    z(红)

处理: 对父亲左旋，转换为情况3
```

**情况3：叔叔是黑色，z 是左孩子**

```
插入前:              右旋+变色:
    G(黑)                P(黑)
   / \                  / \
  U(黑) P(红)          z(红) G(红)
       /                     /
      z(红)                 U(黑)

处理: 父亲变黑，祖父变红，对祖父右旋
```

### 4.3 插入修复代码

```java
private void insertFixup(Node z) {
    while (z.parent != null && z.parent.color == RED) {
        if (z.parent == z.parent.parent.left) {
            Node uncle = z.parent.parent.right;
            
            if (uncle != null && uncle.color == RED) {
                // 情况1：叔叔是红色
                z.parent.color = BLACK;
                uncle.color = BLACK;
                z.parent.parent.color = RED;
                z = z.parent.parent;
            } else {
                if (z == z.parent.right) {
                    // 情况2：叔叔是黑色，z 是右孩子
                    z = z.parent;
                    leftRotate(z);
                }
                // 情况3：叔叔是黑色，z 是左孩子
                z.parent.color = BLACK;
                z.parent.parent.color = RED;
                rightRotate(z.parent.parent);
            }
        } else {
            // 对称情况
            // ...
        }
    }
    root.color = BLACK;
}
```

## 五、删除操作与修复

### 5.1 删除步骤

1. 按照 BST 的方式删除节点
2. 如果删除的是红色节点，无需修复
3. 如果删除的是黑色节点，需要修复性质5

### 5.2 删除修复的四种情况

**情况1：兄弟节点是红色**

```
处理: 兄弟变黑，父亲变红，对父亲左旋，更新兄弟
```

**情况2：兄弟节点是黑色，且兄弟的两个孩子都是黑色**

```
处理: 兄弟变红，当前节点上移到父亲
```

**情况3：兄弟节点是黑色，兄弟的左孩子是红色，右孩子是黑色**

```
处理: 兄弟的左孩子变黑，兄弟变红，对兄弟右旋，更新兄弟
```

**情况4：兄弟节点是黑色，兄弟的右孩子是红色**

```
处理: 兄弟颜色设为父亲颜色，父亲变黑，兄弟的右孩子变黑，对父亲左旋
```

### 5.3 删除修复代码

```java
private void deleteFixup(Node x) {
    while (x != root && x.color == BLACK) {
        if (x == x.parent.left) {
            Node w = x.parent.right;  // 兄弟节点
            
            if (w.color == RED) {
                // 情况1
                w.color = BLACK;
                x.parent.color = RED;
                leftRotate(x.parent);
                w = x.parent.right;
            }
            
            if (w.left.color == BLACK && w.right.color == BLACK) {
                // 情况2
                w.color = RED;
                x = x.parent;
            } else {
                if (w.right.color == BLACK) {
                    // 情况3
                    w.left.color = BLACK;
                    w.color = RED;
                    rightRotate(w);
                    w = x.parent.right;
                }
                // 情况4
                w.color = x.parent.color;
                x.parent.color = BLACK;
                w.right.color = BLACK;
                leftRotate(x.parent);
                x = root;
            }
        } else {
            // 对称情况
            // ...
        }
    }
    x.color = BLACK;
}
```

## 六、时间复杂度分析

### 6.1 树的高度

红黑树的高度 h ≤ 2 × log₂(n+1)

证明：
- 设最短路径长度为 b（全是黑节点）
- 最长路径长度 ≤ 2b（红黑交替）
- 以最短路径为根的子树至少有 2ᵇ - 1 个黑节点
- n ≥ 2ᵇ - 1 → b ≤ log₂(n+1)
- h ≤ 2b ≤ 2 × log₂(n+1)

### 6.2 操作复杂度

| 操作 | 时间复杂度 | 旋转次数 |
|------|-----------|----------|
| 查找 | O(log n) | 0 |
| 插入 | O(log n) | ≤ 2 |
| 删除 | O(log n) | ≤ 3 |

### 6.3 与其他数据结构对比

| 数据结构 | 查找 | 插入 | 删除 | 适用场景 |
|----------|------|------|------|----------|
| 数组 | O(n) | O(n) | O(n) | 静态数据 |
| 链表 | O(n) | O(1) | O(1) | 频繁插入删除 |
| 二叉搜索树 | O(n) | O(n) | O(n) | 不保证平衡 |
| AVL 树 | O(log n) | O(log n) | O(log n) | 查找密集 |
| 红黑树 | O(log n) | O(log n) | O(log n) | 通用平衡树 |
| 哈希表 | O(1) | O(1) | O(1) | 快速查找 |

## 七、Java 中的应用

### 7.1 TreeMap

```java
// TreeMap 内部使用红黑树实现
TreeMap<String, Integer> map = new TreeMap<>();
map.put("Apple", 1);
map.put("Banana", 2);
map.put("Cherry", 3);

// 有序遍历（红黑树保证有序）
for (Map.Entry<String, Integer> entry : map.entrySet()) {
    System.out.println(entry.getKey() + ": " + entry.getValue());
}
// 输出: Apple, Banana, Cherry (按字母顺序)
```

### 7.2 HashMap (Java 8+)

```java
// 当链表长度 >= 8 时，转换为红黑树
HashMap<String, Integer> map = new HashMap<>();
// 底层：数组 + 链表 + 红黑树
```

### 7.3 TreeSet

```java
// TreeSet 内部使用 TreeMap (红黑树) 实现
TreeSet<Integer> set = new TreeSet<>();
set.add(3);
set.add(1);
set.add(4);
set.add(1);
set.add(5);

// 自动去重且有序
System.out.println(set);  // [1, 3, 4, 5]
```

### 7.4 ConcurrentHashMap (Java 8+)

```java
// 同样在链表过长时转换为红黑树
ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();
```

## 八、Linux 内核中的应用

### 8.1 CFS 调度器

Linux 的完全公平调度器（CFS）使用红黑树管理进程：

```c
// 简化的 CFS 调度器结构
struct cfs_rq {
    struct rb_root tasks_timeline;  // 红黑树根
    struct rb_node *rb_leftmost;    // 最左节点（下一个运行的进程）
    // ...
};

// 虚拟运行时间(vruntime)作为键值
// 最左节点总是 vruntime 最小的进程
```

### 8.2 内存管理

```c
// 虚拟内存区域(VMA)管理
struct mm_struct {
    struct rb_root mm_rb;  // 红黑树管理所有 VMA
    // ...
};
```

## 九、总结

### 9.1 红黑树的优势

| 优势 | 说明 |
|------|------|
| 平衡性 | 保证 O(log n) 的操作复杂度 |
| 效率 | 插入删除旋转次数少 |
| 实用性 | 广泛应用于标准库 |
| 灵活性 | 实现相对简单 |

### 9.2 红黑树的性质口诀

```
红黑树，五性质：
1. 节点非红即黑
2. 根黑叶黑要记牢
3. 红子必黑不能忘
4. 黑数相同是关键
5. 最长不过两倍短
```

:::tip 学习建议
1. 理解五个性质的含义
2. 掌握旋转操作的图示
3. 手动模拟插入和删除的过程
4. 结合 Java TreeMap 源码学习
5. 理解应用场景和与其他数据结构的对比
:::
