!
function (B, d, C) {
  var z = function () {
    function f(b, c) {
      this.dom = b;
      this.setOptions(c);
      this.render()
    }
    f.prototype.options = {
      mapName: "china",
      mapWidth: 500,
      mapHeight: 400,
      stateColorList: "2770B5 429DD4 5AABDA 1C8DFF 70B3DD C6E1F4 EDF2F6".split(" "),
      stateDataAttr: ["stateInitColor", "stateHoverColor", "stateSelectedColor", "baifenbi"],
      stateDataType: "json",
      stateSettingsXmlPath: "",
      stateData: {},
      strokeWidth: 1,
      strokeColor: "F9FCFE",
      strokeHoverColor: "d9d9d9",
      stateInitColor: "",
      stateHoverColor: "ffffff",
      stateSelectedColor: "E32F02",
      stateDisabledColor: "eeeeee",
      showTip: !0,
      tipWidth: 280,
      tipHeight: 110,
      tipOuterH: 30,
      tipOuterW: 30,
      stateTipHtml: function (b, c) {
        return c.name
      },
      hoverCallback: function (b, c) {},
      clickCallback: function (b, c) {},
      external: !1
    };
    f.prototype.setOptions = function (b) {
      null == b && (b = null);
      this.options = d.extend({}, this.options, b);
      return this
    };
    f.prototype.scaleRaphael = function (b, c, d) {
      var e = document.getElementById(b);
      e.style.position || (e.style.position = "relative");
      e.style.width = c + "px";
      e.style.height = d + "px";
      e.style.overflow = "hidden";
      var l;
      "VML" == Raphael.type ? (e.innerHTML = "<rvml:group style='position : absolute; width: 1000px; height: 1000px; top: 0px; left: 0px' coordsize='1000,1000' class='rvml' id='vmlgroup_" + b + "'></rvml:group>", l = document.getElementById("vmlgroup_" + b)) : (e.innerHTML = '<div class="svggroup"></div>', l = e.getElementsByClassName("svggroup")[0]);
      var q = new Raphael(l, c, d),
        f;
      "SVG" == Raphael.type ? q.canvas.setAttribute("viewBox", "0 0 " + c + " " + d) : f = e.getElementsByTagName("div")[0];
      q.changeSize = function (b, m, h, k) {
          k = !k;
          var n = b / c,
            a = m / d,
            g = n < a ? n : a,
            n = parseInt(d * g),
            a = parseInt(c * g);
          if ("VML" == Raphael.type) {
              var y = document.getElementsByTagName("textpath"),
                u;
              for (u in y) {
                  var v = y[u];
                  if (v.style) {
                    if (!v._fontSize) {
                      var A = v.style.font.split("px");
                      v._fontSize = parseInt(A[0]);
                      v._font = A[1]
                    }
                    v.style.font = v._fontSize * g + "px" + v._font
                  }
                }
              u = a < n ? 1E3 * a / c : 1E3 * n / d;
              u = parseInt(u);
              l.style.width = u + "px";
              l.style.height = u + "px";
              k && (l.style.left = parseInt((b - a) / 2) + "px", l.style.top = parseInt((m - n) / 2) + "px");
              f.style.overflow = "visible"
            }
          k && (a = b, n = m);
          e.style.width = a + "px";
          e.style.height = n + "px";
          q.setSize(a, n);
          h && (e.style.position = "absolute", e.style.left = parseInt((b - a) / 2) + "px", e.style.top = parseInt((m - n) / 2) + "px")
        };
      q.scaleAll = function (b) {
          q.changeSize(c * b, d * b)
        };
      q.changeSize(c, d);
      q.w = c;
      q.h = d;
      return q
    };
    f.prototype.render = function () {
      var b = this.options,
        c = this.dom,
        f = eval(b.mapName + "MapConfig"),
        e = {};
      "xml" == b.stateDataType ? d.ajax({
          type: "GET",
          url: b.stateSettingsXmlPath,
          async: !1,
          dataType: d.browser.msie ? "text" : "xml",
          success: function (u) {
            var a;
            d.browser.msie ? (a = new ActiveXObject("Microsoft.XMLDOM"), a.async = !1, a.loadXML(u)) : a = u;
            d(a).find("stateData").each(function (a) {
              var u = d(this),
                c = u.attr("stateName");
              e[c] = {};
              a = 0;
              for (var f = b.stateDataAttr.length; a < f; a++) e[c][b.stateDataAttr[a]] = u.attr(b.stateDataAttr[a])
            })
          }
        }) : e = b.stateData;
      var l = function (a) {
          var c = d(a.node).offset().left + d(a.node).outerWidth() / 2,
            f = d(a.node).offset().top + d(a.node).outerHeight() / 2,
            e = b.tipWidth,
            h = b.tipHeight,
            k = a.direction,
            m = b.tipOuterH,
            n = b.tipOuterW,
            q = a = 0,
            g = [],
            l = [],
            p = [],
            w = [],
            x = [],
            r = e,
            t = h;
          "left" == k || "right" == k ? (r = e + n, t = h, f -= t / 2, "left" == k ? (c -= r, g = [r, t / 2], l = [0, 0], p = [e, 0], w = [0, t], x = [e, t]) : (a = n, g = [0, t / 2], l = [r, 0], p = [n, 0], w = [r, t], x = [n, t])) : (r = e, t = h + m, "top" == k ? (c -= r / 2, f -= t, g = [r / 2, t], l = [0, 0], p = [0, h], w = [r, 0], x = [r, h]) : (q = m, c -= r / 2, g = [r / 2, 0], l = [0, t], p = [0, m], w = [r, t], x = [r, m]));
          e = Raphael("stateTip", r, t);
          e.path("M" + g[0] + "," + g[1] + "L" + p[0] + "," + p[1] + "L" + x[0] + "," + x[1] + "Z").attr({
              fill: "#e9e9e9",
              opacity: .4,
              stroke: "#e9e9e9"
            });
          e.path("M" + g[0] + "," + g[1] + "L" + p[0] + "," + p[1] + "L" + l[0] + "," + l[1] + "Z").attr({
              fill: "#aaaaaa",
              opacity: .4,
              stroke: "#aaaaaa"
            });
          e.path("M" + g[0] + "," + g[1] + "L" + l[0] + "," + l[1] + "L" + w[0] + "," + w[1] + "Z").attr({
              fill: "#c9c8c8",
              opacity: .4,
              stroke: "#c9c8c8"
            });
          e.path("M" + g[0] + "," + g[1] + "L" + w[0] + "," + w[1] + "L" + x[0] + "," + x[1] + "Z").attr({
              fill: "#d7d6d6",
              opacity: .4,
              stroke: "#d7d6d6"
            });
          return [c, f, a, q]
        },
        q = this.scaleRaphael(c.attr("id"), f.width, f.height),
        z = {
          cursor: "pointer",
          stroke: "#" + b.strokeColor,
          "stroke-width": b.strokeWidth,
          "stroke-linejoin": "round"
        },
        p = {},
        m, h;
      for (h in f.shapes) {
          var k = e[h],
            n = "#" + (k && b.stateColorList[k.stateInitColor] || b.stateInitColor || f.names[h].color),
            a = "#" + (k && k.stateHoverColor || b.stateHoverColor),
            g = "#" + (k && k.stateSelectedColor || b.stateSelectedColor),
            k = "#" + (k && k.stateDisabledColor || b.stateDisabledColor);
          p[h] = {};
          p[h].initColor = n;
          p[h].hoverColor = a;
          p[h].selectedColor = g;
          a = q.path(f.shapes[h]);
          a.id = h;
          a.name = f.names[h].name;
          a.attr(z);
          a.attr({
              fill: n
            });
          var g = a.getBBox().x + f.names[h].x,
            y = a.getBBox().y + f.names[h].y,
            g = q.text(g, y, a.name).attr({
              cursor: "pointer",
              metadata: {
                mapId: 1
              }
            });
          a.font = g;
          g.obj = a;
          g.direction = f.names[h].direction;
          g.mapId = a.mapId = f.names[h].id;
          b.external && (b.external[a.id] = a);
          e[h] && e[h].diabled ? a.attr({
              fill: k,
              cursor: "default"
            }) : (a.attr({
              fill: n
            }), m = a, a.mousemove(function () {
              m.attr({
                fill: p[m.id].initColor,
                stroke: "#" + b.strokeColor
              });
              m = this;
              this.attr({
                fill: p[this.id].hoverColor,
                stroke: "#" + b.strokeHoverColor
              });
              if (b.showTip && d(".mapTipText.mapTipText" + this.mapId).length) {
                d("#stateTip").empty();
                var a = new l(this.font);
                d("#stateTip").stop(!1, !0).animate({
                  left: a[0],
                  top: a[1],
                  display: "inline"
                }, 100).show().append('<div id="mapTipContainer"></div>');
                console.log();
                d("#mapTipContainer").css({
                  position: "absolute",
                  left: a[2],
                  top: a[3]
                });
                d(".mapTipText.mapTipText" + this.mapId).clone().appendTo("#mapTipContainer")
              } else d("#stateTip").empty()
            }), g.mousemove(function () {
              m.attr({
                fill: p[m.id].initColor,
                stroke: "#" + b.strokeColor
              });
              m = this.obj;
              this.obj.attr({
                fill: p[this.obj.id].hoverColor,
                stroke: "#" + b.strokeHoverColor
              });
              if (b.showTip && d(".mapTipText.mapTipText" + this.mapId).length) {
                d("#stateTip").empty();
                var a = new l(this);
                d("#stateTip").stop(!1, !0).animate({
                  left: a[0],
                  top: a[1],
                  display: "inline"
                }, 100).show().append('<div id="mapTipContainer"></div>');
                console.log();
                d("#mapTipContainer").css({
                  position: "absolute",
                  left: a[2],
                  top: a[3]
                });
                d(".mapTipText.mapTipText" + this.mapId).clone().appendTo("#mapTipContainer")
              } else d("#stateTip").empty()
            }));
          q.changeSize(b.mapWidth, b.mapHeight, !1, !1)
        }
      d("body").mousemove(function (a) {
          if (a.pageX < c.offset().left || a.pageX > c.offset().left + c.innerWidth() || a.pageY < c.offset().top || a.pageY > c.offset().top + c.innerHeight()) m.attr({
            fill: p[m.id].initColor,
            stroke: "#" + b.strokeColor
          }),
          d("#stateTip").empty()
        })
    };
    return f
  }();
  d.fn.SVGMap = function (f) {
    var b = d(this),
      c = b.data();
    c.SVGMap && delete c.SVGMap;
    !1 !== f && (c.SVGMap = new z(b, f));
    return c.SVGMap
  }
}(window, jQuery);