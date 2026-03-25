这份文档旨在为 **Codex** 提供清晰的项目背景、技术架构及核心逻辑，以便其生成高质量的开发计划（Roadmap）。

---

# 📝 项目需求与技术规格说明书 (PRD/Tech Spec)

## 1. 项目概览 (Project Overview)
**项目名称：** OmniSpatial AI (暂定名)
**核心定位：** 一套通用的、基于 AI 驱动的 **空间智能操作系统 (Spatial Intelligence OS)**。
**核心痛点：** 解决传统 GIS 软件门槛高、数据处理碎片化、2D/3D 引擎不兼容以及分析流程复杂的问题。
**核心愿景：** 让用户通过**自然语言**即可完成从“数据导入”到“空间分析”再到“地图制图”的全流程闭环。

---

## 2. 技术栈要求 (Tech Stack)
* **基础框架：** Next.js 16+ (App Router), TypeScript, Tailwind CSS.
* **AI 编排：** Vercel AI SDK。
* **前端组件库：** Assistant UI、shadcn-ui。
* **地图引擎支持：** Mapbox GL JS (2D/2.5D), Cesium.js (3D), Leaflet (轻量化).
* **空间分析层：**
    * *前端：* Turf.js (轻量运算)。
    * *后端/边缘：* DuckDB-Spatial (高性能矢量运算)、PostGIS (大规模存储)。
    * *算法服务：* Python (FastAPI + GeoPandas) 用于重型分析。
* **数据格式：** 统一采用 GeoJSON 作为中间交换格式；支持 GeoParquet。

---

## 3. 核心架构：引擎无关适配器 (Engine Agnostic Adapter)
项目必须实现一套 **“一套逻辑，多端驱动”** 的架构，防止业务逻辑与具体的地图库耦合。

### **3.1 抽象层设计 (Map Controller)**
* **通用指令集 (GisAction Schema)：** 定义一套标准的 JSON 指令，如 `MOVE_TO`, `ADD_LAYER`, `CALC_BUFFER`。
* **适配器模式 (Adapter Pattern)：** 针对不同引擎编写适配器（MapboxAdapter, CesiumAdapter），将通用指令转换为特定的 API 调用。
* **状态同步：** 确保在切换 2D/3D 模式时，缩放层级、中心点坐标和已加载图层能无缝衔接。

---

## 4. AI 智能体设计 (AI & Agent Logic)
系统应具备一个“空间调度大脑”，执行以下流程：
1.  **意图拆解：** 将用户自然语言（如“分析河边 500 米的违章建筑”）拆解为原子任务。
2.  **工具调用 (Function Calling)：**
    * 调用 `getGeocoding` 获取河流坐标。
    * 调用 `runBufferAnalysis` 生成多边形。
    * 调用 `queryLayerData` 筛选属性。
3.  **代码解释器 (Optional)：** 动态生成 Python/SQL 代码并在安全沙箱中执行复杂分析。

---

## 5. 功能模块规划 (Phased Features)

### **第一阶段：核心 MVP (基础交互)**
* **对话式地图控制：** 实现通过聊天框控制地图平移、缩放、切换底图。
* **多格式文件解析：** 实现拖拽上传 GeoJSON/Excel 并自动上图。
* **2D/3D 引擎切换：** 完成 Mapbox 与 Cesium 的基础适配与视角同步。

### **第二阶段：空间分析 Agent (深度功能)**
* **自动化空间计算：** 集成 Turf.js 和 DuckDB 实现缓冲区、叠加分析。
* **语义样式引擎：** 基于 AI 描述自动调整图层颜色、热力图参数。
* **中国地图合规性：** 集成天地图、高德底图及 GCJ-02 坐标纠偏逻辑。

### **第三阶段：行业应用与叙事 (进阶功能)**
* **生成式地图故事：** AI 自动根据分析结果配置镜头转场和文字说明。
* **外部 API 插件系统：** 支持接入实时气象、交通、遥感影像接口。

---