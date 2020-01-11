// 嗯，这是最初的数据。
var treeData = {
  name: "Top Level",
  imgSrc: './pic.jpg',
  children: [
    {
      name: "Level 2: A",
      imgSrc: 'pic.jpg',
      children: [
        {name: "Son of A", imgSrc: 'pic.jpg',},
        {name: "Daughter of A", imgSrc: 'pic.jpg',}]
    },
    {name: "Level 2: B", imgSrc: 'pic.jpg',}
  ]
};
// 设置图表的宽高和Margin
var margin = {top: 20, right: 90, bottom: 30, left: 90},
  width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;
var svg = d3
  .select("body")
  // 在页面的body里添加svg对象
  .append("svg")
  // 设置svg宽高
  .attr("width", width + margin.right + margin.left)
  .attr("height", height + margin.top + margin.bottom)
  // 在svg里添加group元素
  .append("g")
  // 将group放置在左上方
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
var i = 0,
  duration = 750,
  root;
// 定义Tree层级，并设置宽高
var treemap = d3.tree().size([height, width]);
// 计算父节点、字节点、高度和深度（parent, children, height, depth）
root = d3.hierarchy(treeData, function (d) {
  return d.children;
});
// 设置第一个元素的初始位置
root.x0 = height / 2;
root.y0 = 0;
// 第二层以上元素收起
root.children.forEach(collapse);
// 更新节点状态
update(root);

// collapse方法，用于切换子节点的展开和收起状态
function collapse(d) {
  if (d.children) {
    d._children = d.children;
    d._children.forEach(collapse);
    d.children = null;
  }
}

function update(source) {
  // 设置节点的x、y位置信息
  var treeData = treemap(root);
  // 计算新的Tree层级
  var nodes = treeData.descendants(),
    links = treeData.descendants().slice(1);
  // 设置每个同级节点间的y间距为180
  nodes.forEach(function (d) {
    d.y = d.depth * 180;
  });
  // ****************** 节点部分操作 ***************************
  // 给节点添加id，用于选择集索引
  var node = svg.selectAll("g.node").data(nodes, function (d) {
    return d.id || (d.id = ++i);
  });
  // 添加enter操作，添加类名为node的group元素
  var nodeEnter = node
    .enter()
    .append("g")
    .attr("class", "node")
    // 默认位置为当前父节点的位置
    .attr("transform", function (d) {
      return "translate(" + source.y0 + "," + source.x0 + ")";
    })
    // 给每个新加的节点绑定click事件
    .on("click", click)
    //添加其他事件
    .on("mouseover", d => {
      // 从d3.event获取鼠标的位置
      var transform = d3.event;
      var yPosition = transform.offsetY + 20;
      var xPosition = transform.offsetX + 20;
      // 将浮层位置设置为鼠标位置
      var chartTooltip = d3
        .select(".chartTooltip")
        .style("left", xPosition + "px")
        .style("top", yPosition + "px");
      // 更新浮层内容
      // chartTooltip.select(".name").text(d.data.name);
      //   console.log(`./${d.data.imgSrc}`);
      chartTooltip.select(".name").html("<img src='pic.jpg' alt='img' class='thumb'>");
      // 移除浮层hidden样式，展示浮层
      chartTooltip.classed("hidden", false);
    })
    // 添加mouseover事件
    .on("mouseout", () => {
      // 添加浮层hidden样式，隐藏浮层
      d3.select(".chartTooltip").classed("hidden", true);
    });


// 给每个新加的group元素添加cycle元素
  nodeEnter
    .append("circle")
    .attr("class", "node")
    .attr("r", 1e-6)
    // 如果元素有子节点，且为收起状态，则填充浅蓝色
    .style("fill", function (d) {
      return d._children ? "#0aa344" : "#56E39F";
    })
    .style("stroke", function (d) {
      return d._children ? "#0aa344" : "#56E39F";
    })
// 给每个新加的group元素添加文字说明
  nodeEnter
    .append("text")
    .attr("dy", ".35em")
    .attr("x", function (d) {
      return d.children || d._children ? -13 : 13;
    })
    .attr("text-anchor", function (d) {
      return d.children || d._children ? "end" : "start";
    })
    .text(function (d) {
      return d.data.name;
    });
// 获取update集
  var nodeUpdate = nodeEnter.merge(node);
// 设置节点的位置变化，添加过渡动画效果
  nodeUpdate
    .transition()
    .duration(duration)
    .attr("transform", function (d) {
      return "translate(" + d.y + "," + d.x + ")";
    });
// 更新节点的属性和样式
  nodeUpdate
    .select("circle.node")
    .attr("r", 10)
    .style("fill", function (d) {
      return d._children ? "#0aa344" : "#56E39F";
    })
    .style("stroke", function (d) {
      return d._children ? "#0aa344" : "#56E39F";
    })
    .attr("cursor", "pointer");
// 获取exit操作
  var nodeExit = node
    .exit()
    // 添加过渡动画
    .transition()
    .duration(duration)
    .attr("transform", function (d) {
      return "translate(" + source.y + "," + source.x + ")";
    })
    // 移除元素
    .remove();
// exit集中节点的cycle元素尺寸变为0
  nodeExit.select("circle").attr("r", 1e-6);
// exit集中节点的text元素可见度降为0
  nodeExit.select("text").style("fill-opacity", 1e-6);


// ****************** 连接线部分操作 ***************************
// 更新数据
  var link = svg.selectAll("path.link").data(links, function (d) {
    return d.id;
  });

  // 添加enter操作，添加类名为link的path元素
  var linkEnter = link
    .enter()
    .insert("path", "g")
    .attr("class", "link")
    // 添加id
    .attr("id", d => {
      return "textPath" + d.id;
    })
    .on("mouseover", function (d) {
      d3.select(this).style("stroke", "orange");
      // console.log(this);
      d3.select(this).style("stroke", "orange");
    })
    .on("mouseout", function (d) {
      d3.select(this).style("stroke", "#CCC");
    })
    .on("click", d => {
      alert(d.parent.data.name + ' -> ' + d.data.name);
    })
    // 默认位置为当前父节点的位置
    .attr("d", function (d) {
      var o = {
        x: source.x0,
        y: source.y0
      };
      return diagonalReverse(o, o);
    });

  // enter操作中，添加text，同时添加与path匹配的textPath
  link
    .enter()
    .append("text")
    // 给text添加textPath元素
    .append("textPath")
    // 给textPath设置path的引用
    .attr("xlink:href", d => {
      return "#textPath" + d.id;
    })
    // 字体居中
    .style("text-anchor", "middle")
    .attr("startOffset", "50%")
    // 父节点的name
    .style("fill", "red")
    .text(function (d) {
      return d.parent.id;
    })
    .append("tspan")
    .style("fill", "blue")
    .text(' --> ')
    // 子节点的name
    .append("tspan")
    .style("fill", "red")
    .text(function (d) {
      return d.id;
    });

  // 获取update集
  var linkUpdate = linkEnter.merge(link);

  // 更新添加过渡动画
  linkUpdate
    .transition()
    .duration(duration)
    .attr("d", function (d) {
      return diagonalReverse(d, d.parent);
    });

  // 获取exit集
  var linkExit = link
    .exit()
    // 设置过渡动画
    .transition()
    .duration(duration)
    .attr("d", function (d) {
      var o = {
        x: source.x,
        y: source.y
      };
      return diagonalReverse(o, o);
    })
    // 移除link
    .remove();

// 为动画过渡保存旧的位置
  nodes.forEach(function (d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
  // 当点击时，切换children，同时用_children来保存原子节点信息
  function click(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    update(d);
  }
}


/*
* 移动和缩放(一定要在图上操作)
*
* */

// 子group元素存为view变量
var view = svg
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
// 创建zoom操作
var zoom = d3
  .zoom()
  // 设置缩放区域为0.1-100倍
  .scaleExtent([0.1, 100])
  .filter(function () {
    // isWheelEvent为是否滚轮事件
    var isWheelEvent = d3.event instanceof WheelEvent;
    // 返回是否ctrl与滚轮同时触发
    return !isWheelEvent || (isWheelEvent && d3.event.shiftKey);
  })
  .on("zoom", () => {
    console.log(d3.event.transform.x + margin.left);
    // 子group元素将响应zoom事件，并更新transform状态
    view.attr(
      "transform",
      "translate(" +
      (d3.event.transform.x + margin.left) +
      "," +
      (d3.event.transform.y + margin.top) +
      ") scale(" +
      d3.event.transform.k +
      ")"
    );
  });
// svg层绑定zoom事件
svg.call(zoom);

// 获取最多的子节点数
function getMax(obj) {
  let max = 0;
  if (obj.children) {
    max = obj.children.length;
    obj.children.forEach(d => {
      const tmpMax = this.getMax(d);
      if (tmpMax > max) {
        max = tmpMax;
      }
    });
  }
  return max;
}

// 获取最深层级数
function getDepth(obj) {
  var depth = 0;
  if (obj.children) {
    obj.children.forEach(d => {
      var tmpDepth = this.getDepth(d);
      if (tmpDepth > depth) {
        depth = tmpDepth;
      }
    });
  }
  return 1 + depth;
}

function updateChart(source) {
  // 大致计算需要放大的倍数
  var scale =
    (getDepth(root) / 8 || 0.5) +
    (getMax(root) / 12 || 0.5);
  // 定义Tree层级，并设置宽高
  var treemap = d3.tree().size([height * scale, width]);
  // 其他处理
}

//添加曲线（修正过的方向）
function diagonalReverse(s = {}, d = {}) {
  // console.log(s, d);
  path = `M ${d.y} ${d.x}
                  C ${(s.y + d.y) / 2} ${d.x},
                  ${(s.y + d.y) / 2} ${s.x},
                  ${s.y} ${s.x}`;
  return path;
}
