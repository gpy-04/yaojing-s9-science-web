import './styles.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

type TimelineEvent = {
  year: string;
  title: string;
  detail: string;
  context: string;
  impact: string;
  source: string;
  track: 'auto' | 'ai';
};

type ArchiveMeta = {
  image?: string;
  imageAlt?: string;
  caption?: string;
  credit?: string;
  sourceUrl?: string;
  story?: string;
  quote?: string;
};

const autoEvents: TimelineEvent[] = [
  { year: '约公元前 3500 年', title: '轮子改变移动', detail: '人类第一次把“搬运”从脚下交给了圆形结构。', context: '轮子并不是汽车，却重新定义了“移动”的基本语法：滚动、承载、转向与减阻。后来的车轮、铁路和机器人，都继承了这次结构性变化。', impact: '移动从“背负”变成“滚动”，距离开始由工具而不是体力决定。', source: '人类技术史 / 概念节点', track: 'auto' },
  { year: '1769–1770', title: '蒸汽开始驱动车辆', detail: '道路车辆进入机械动力实验阶段，速度第一次成为工程问题。', context: '尼古拉·约瑟夫·居纽制造的蒸汽车辆，常被视为早期自走式道路车辆之一。它笨重、缓慢，却把动力、锅炉、车架和制动放进了同一个系统。', impact: '车辆不再依赖动物牵引，动力源第一次被装进车体。', source: 'Library of Congress / Cugnot', track: 'auto' },
  { year: '1832–1839', title: '电力第一次上车', detail: '电动车实验说明，安静而可控的动力并非新想法。', context: '19 世纪的电动车实验比很多人想象得更早。电机、蓄电池与车轮之间的组合，已经出现了今天电动车的基本关系，只是当时的能量密度和基础设施还无法支撑普及。', impact: '电动化不是突然出现的潮流，而是一条被反复探索的路线。', source: 'Library of Congress / Anderson', track: 'auto' },
  { year: '1885–1886', title: '汽车成为独立机器', detail: '内燃机、底盘和转向系统被组合成可驾驶的现代汽车雏形。', context: '卡尔·奔驰的三轮汽车把发动机、车架、转向和制动组织成一个可操作的整体。它不代表“唯一的汽车发明”，但成为现代汽车史上的关键里程碑。', impact: '汽车从机械实验变成一种可以被驾驶、复制和改进的产品形态。', source: 'Library of Congress / Benz Patent-Motorwagen', track: 'auto' },
  { year: '1908–1913', title: '从发明走向普及', detail: '标准化与流水线让汽车进入规模化制造。', context: '福特 Model T 与移动装配线改变了汽车的生产逻辑：零件更统一，装配更连续，汽车开始从少数人的昂贵玩具变成大规模工业产品。', impact: '汽车从“某个人的机器”变成城市、道路和生活方式的一部分。', source: '汽车工业史 / Ford production', track: 'auto' },
  { year: '2010s', title: '电动平台重写底盘', detail: '电池成为底盘的一部分，软件开始参与定义车辆。', context: '现代纯电平台把电池、电机、热管理和电子控制重新组织在车身内部。这里的重点不是某一款车的参数，而是动力系统与车体结构之间的关系发生了变化。', impact: '汽车从机械总成转向“能源系统 + 计算系统 + 移动平台”。', source: '当代工程概览 / 概念节点', track: 'auto' },
  { year: '今天', title: '车开始感知环境', detail: '传感器、计算平台与驾驶辅助把汽车变成会观察的机器。', context: '摄像头、雷达、定位和车载计算把道路变成一组持续更新的数据。车辆仍需要清晰的边界和人的监督，但它已经开始用机器的方式读取环境。', impact: '汽车的核心问题从“如何驱动”扩展到“如何理解正在发生的事”。', source: '当代智能汽车 / 技术概览', track: 'auto' },
];

const aiEvents: TimelineEvent[] = [
  { year: '1950', title: '机器能否思考？', detail: '图灵把问题改写成可观察、可讨论的测试。', context: '艾伦·图灵没有把“思考”定义成一个神秘内在状态，而是提出用对话表现来讨论机器是否展现出类似智能的行为。这个转向影响了后来的人机交互与智能评估。', impact: 'AI 的问题从哲学猜想变成可以设计实验、比较行为的问题。', source: 'Alan Turing / Computing Machinery and Intelligence', track: 'ai' },
  { year: '1956', title: '人工智能获得名字', detail: '达特茅斯会议把“人工智能”确立为一项研究议程。', context: '达特茅斯暑期研究项目提出：学习、语言、抽象和解决问题等能力，可以被描述得足够精确，从而让机器模拟它们。这个名字成为一整个研究领域的入口。', impact: '智能第一次被组织成一个跨学科的工程目标。', source: 'Dartmouth Summer Research Project', track: 'ai' },
  { year: '1958', title: '机器开始从样例学习', detail: '感知机让“输入—权重—判断”成为可运行的模型。', context: 'Rosenblatt 的感知机把一个简单的分类过程变成可训练的计算系统。它还远远不是今天的深度网络，却为神经网络、权重和训练这些概念提供了早期实验场。', impact: '机器不只执行写好的规则，也可以通过样例调整自己的判断方式。', source: 'Frank Rosenblatt / Perceptron', track: 'ai' },
  { year: '1980s–1990s', title: '从规则走向统计', detail: '机器从手写规则走向从数据中寻找模式。', context: '专家系统把知识写进规则，统计学习则让机器从数据中估计关系。两条路线长期并行，推动了语音、搜索、推荐和文本处理等应用。', impact: '数据逐渐成为模型能力的一部分，AI 开始与真实样本规模绑定。', source: '机器学习史 / 概括节点', track: 'ai' },
  { year: '1997', title: '机器在特定任务上超越人类', detail: '专用计算系统展示了机器在特定任务中的强大能力。', context: 'IBM Deep Blue 击败国际象棋世界冠军，让公众看到：在规则清晰、搜索空间可建模的任务里，机器可以凭借计算规模和专用策略取得优势。', impact: '“机器很聪明”被拆解成了更具体的问题：在哪个任务、用什么数据、以什么代价。', source: 'IBM Deep Blue / 1997', track: 'ai' },
  { year: '2012', title: '深度学习重新加速', detail: '更大的数据集、算力与神经网络让识别能力跃迁。', context: 'AlexNet 在 ImageNet 竞赛中的表现成为深度学习重新进入主流视野的标志之一。关键不只在网络结构，也在数据、GPU 和训练工程共同成熟。', impact: '视觉、语音和语言系统进入了更快的规模化迭代阶段。', source: 'AlexNet / ImageNet 2012', track: 'ai' },
  { year: '2020s', title: '生成式 AI 进入日常', detail: '模型不只识别世界，也开始生成文字、图像、声音与代码。', context: '生成式模型把“理解输入”推进到“产生输出”：它们可以根据提示生成内容，也暴露出事实性、偏差、版权和责任等新的问题。', impact: 'AI 从后台工具走到交互界面，普通人开始直接参与模型的输入与反馈。', source: '当代 AI 概览 / 时代节点', track: 'ai' },
  { year: '今天', title: 'AI 进入物理世界', detail: '算法开始与摄像头、雷达、执行器和真实道路共同工作。', context: '当模型与传感器、机器人和车辆相连，错误不再只是一段文本不准确，而可能改变一个真实环境中的动作。因此，感知、预测、规划和安全边界必须一起被设计。', impact: 'AI 的下一阶段不只是在屏幕里回答，而是在现实世界中持续观察和行动。', source: '智能系统 / 技术概览', track: 'ai' },
];

const archiveAssets: Record<string, ArchiveMeta> = {
  '轮子改变移动': {
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b9/Iron_wheels_with_bronze_hubs_-_Nabu_Temple%2C_Palace_of_Sargon_II%2C_Khorsabad%2C_Neo-Assyrian_period%2C_721-705_BC_-_Oriental_Institute_Museum%2C_University_of_Chicago_-_DSC07574.JPG/960px-thumbnail.jpg',
    imageAlt: '东方研究所博物馆收藏的古代铁轮与青铜轮毂',
    caption: '古代车轮实物，年代晚于最初的车轮发明，用来观察轮辐、轮毂与承载结构。',
    credit: 'Wikimedia Commons / Daderot / CC0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Iron_wheels_with_bronze_hubs_-_Nabu_Temple,_Palace_of_Sargon_II,_Khorsabad,_Neo-Assyrian_period,_721-705_BC_-_Oriental_Institute_Museum,_University_of_Chicago_-_DSC07574.JPG',
    story: '真正改变历史的不是一个孤立的圆形，而是轮、轴和承载结构被组合成了一个系统。轮子让搬运不再完全依靠人的肩膀，也让“转向、减阻、连续运动”成为可以被设计的问题。',
    quote: '当重量开始滚动，距离就不再只由人的体力决定。',
  },
  '蒸汽开始驱动车辆': {
    image: 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Nicholas-Cugnots-Dampfwagen.png',
    imageAlt: '巴黎工艺博物馆展出的居纽 1770 年蒸汽车',
    caption: '居纽蒸汽拖车的博物馆实物照片；它把锅炉、车架和驱动轮放进同一台道路车辆。',
    credit: 'Wikimedia Commons / Joe deSousa / CC0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Nicholas-Cugnots-Dampfwagen.png',
    story: '1769 年前后，法国工程师尼古拉·约瑟夫·居纽把蒸汽锅炉装到三轮车上，用来牵引火炮。它的速度很慢，前方锅炉也让转向困难，但这次实验第一次把“动力源、底盘、制动和道路”放进同一个移动系统。',
    quote: '它并不实用，却让“车辆可以自己走”成为工程事实。',
  },
  '电力第一次上车': {
    image: 'https://upload.wikimedia.org/wikipedia/commons/0/01/ElectricCar.png',
    imageAlt: '1890 年 William Morrison 电动车的宣传图',
    caption: 'William Morrison 的电动车宣传图（1890）；早期电动车曾与蒸汽和汽油路线并行。',
    credit: 'Wikimedia Commons / Public domain',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:ElectricCar.png',
    story: '19 世纪的工程师已经在尝试把电机、蓄电池和车轮组合起来。William Morrison 的电动车说明，电驱并不是今天才出现的想法；只是当时电池太重、续航有限，充电网络也没有形成。',
    quote: '技术路线有时不是消失了，而是在等待能量密度和基础设施追上它。',
  },
  '汽车成为独立机器': {
    image: 'https://upload.wikimedia.org/wikipedia/commons/5/56/Benz_Patent_Motorwagen_1886.jpg',
    imageAlt: '奔驰专利汽车博物馆实物',
    caption: '奔驰专利汽车实物照片；1886 年的专利让汽车成为可注册、可复制的工程产品。',
    credit: 'Wikimedia Commons / Stas Kozlovskiy / CC BY-SA 4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Benz_Patent_Motorwagen_1886.jpg',
    story: '卡尔·奔驰的专利汽车把发动机、车架、转向和制动组织成一个可驾驶的整体。贝尔塔·奔驰后来驾驶改进后的车辆完成长途行程，也让公众看到这种机器不只是在车间里运转，而是可以进入真实道路。',
    quote: '汽车第一次拥有了自己的机械语法：动力、方向和人的动作被连在一起。',
  },
  '从发明走向普及': {
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/29/Ford_assembly_line_-_1913.jpg/1280px-Ford_assembly_line_-_1913.jpg',
    imageAlt: '1913 年福特工厂的移动装配线',
    caption: '1913 年福特高地公园工厂的移动装配线，工人正在装配 Model T 的磁电机与飞轮。',
    credit: 'Wikimedia Commons / Public domain',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ford_assembly_line_-_1913.jpg',
    story: '1913 年，福特高地公园工厂把工件送到工人面前，而不是让工人围着一辆车移动。装配被拆成连续、重复、可计时的步骤，底盘装配时间从十多个小时缩短到几个小时，汽车因此从少数人的昂贵机器变成大众工业。',
    quote: '流水线没有发明汽车，却发明了汽车进入普通生活的速度。',
  },
  '电动平台重写底盘': {
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Tesla%20%22Roadster%22%20-%202008.jpg?width=1200',
    imageAlt: '2008 年 Tesla Roadster 电动跑车',
    caption: '2008 年 Tesla Roadster；现代电动车重新把电池、电机与软件放回车辆核心。',
    credit: 'Wikimedia Commons / loudumo / CC BY 2.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Tesla_%22Roadster%22_-_2008.jpg',
    story: '现代纯电平台的变化，不只是把发动机换成电机。电池成为底盘的重要结构，热管理、功率电子和软件一起决定车辆如何加速、制动和更新，汽车开始更像一个持续迭代的移动计算系统。',
    quote: '当能源藏进地板，车身布局和软件更新就获得了新的自由度。',
  },
  '机器能否思考？': {
    image: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Alan_Turing_%281951%29.jpg',
    imageAlt: '1951 年的艾伦·图灵肖像',
    caption: '艾伦·图灵肖像，摄于 1951 年；他在 1950 年论文中提出了后来被称为图灵测试的“模仿游戏”。',
    credit: 'Wikimedia Commons / Elliott & Fry / Public Domain Mark',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Alan_Turing_(1951).jpg',
    story: '图灵没有试图给“思考”下一个不可检验的定义，而是把问题改写成对话实验：如果人无法仅凭交流分辨对方是人还是机器，那么机器是否已经表现出某种智能？这个问题把 AI 从哲学想象带进了可观察的行为。',
    quote: '先不要问机器有没有心灵，先观察它能否在交流中表现出理解。',
  },
  '机器开始从样例学习': {
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/330-PSA-80-60%20%28USN%20710739%29%20%2820897323365%29.jpg?width=1200',
    imageAlt: '1960 年美国海军公布的 Mark I 感知机',
    caption: 'Mark I 感知机的历史照片；它用光电元件接收图案，并通过训练调整识别结果。',
    credit: 'Wikimedia Commons / U.S. Navy / Public domain',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:330-PSA-80-60_(USN_710739)_(20897323365).jpg',
    story: 'Rosenblatt 的 Mark I 感知机把“输入—权重—判断”变成了可运行的机器。它可以通过样例调整自己的识别方式，虽然能力很有限，却让“机器从数据中改变判断”第一次有了看得见的硬件形态。',
    quote: '学习不再只是人脑里的隐喻，而变成了机器内部可以被调整的参数。',
  },
  '机器在特定任务上超越人类': {
    image: 'https://upload.wikimedia.org/wikipedia/commons/b/be/Deep_Blue.jpg',
    imageAlt: '计算机历史博物馆展出的 IBM Deep Blue',
    caption: 'IBM Deep Blue 展品；1997 年，它在国际象棋比赛中击败了世界冠军卡斯帕罗夫。',
    credit: 'Wikimedia Commons / Jim Gardner / CC BY 2.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Deep_Blue.jpg',
    story: 'Deep Blue 的胜利不是“通用智能”突然出现，而是专用硬件、搜索策略和大量计算共同作用的结果。它让公众第一次清楚看到：在规则明确的任务里，机器可以凭借速度、记忆和搜索深度取得人类难以匹敌的优势。',
    quote: '机器的强大，往往首先发生在边界清晰、目标明确的任务里。',
  },
};

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) throw new Error('App root not found');

app.innerHTML = `
  <main class="site-shell">
    <div class="grain" aria-hidden="true"></div>
    <header class="topbar">
      <a class="brand" href="#history" aria-label="返回历史页">
        <span class="brand-mark">YS9</span>
        <span class="brand-name">曜境 S9</span>
      </a>
      <div class="chapter-indicator" aria-label="当前章节">
        <span class="chapter-indicator__active" data-chapter-number>01</span>
        <span class="chapter-indicator__slash">/</span>
        <span>02</span>
        <span class="chapter-indicator__label" data-chapter-label>共同进化</span>
      </div>
      <button class="menu-button" type="button" aria-label="打开章节菜单" data-menu-button>
        <span></span><span></span>
      </button>
    </header>

    <nav class="chapter-menu" aria-label="章节导航" data-chapter-menu>
      <button class="chapter-menu__item is-active" type="button" data-go="history">
        <span>01</span><strong>共同进化</strong><small>汽车 × AI</small>
      </button>
      <button class="chapter-menu__item" type="button" data-go="explore">
        <span>02</span><strong>打开曜境 S9</strong><small>结构 × 感知</small>
      </button>
    </nav>

    <section class="chapter chapter--history is-active" id="history" data-page="history">
      <div class="history-paper">
        <div class="paper-masthead">
          <div class="paper-meta"><span>YJ / S9 ARCHIVE</span><span>VOL. 01 · 2026.10.30</span><span>汽车 × AI · 特刊</span></div>
          <div class="paper-rule"></div>
          <div class="history-intro">
            <p class="eyebrow">CHAPTER 01 / THE SHARED LINE</p>
            <h1>机器如何<br /><em>获得感知</em></h1>
            <div class="intro-copy">
              <p>一份从轮子、蒸汽和电机开始的“移动史”，一份从图灵、感知机和深度学习开始的“理解史”。它们在今天相遇：汽车开始读取世界，AI 开始进入道路。</p>
              <p class="intro-copy__note">这不是一条直线，而是一张由材料、能源、计算和人的想象共同写成的报纸。</p>
              <button class="text-button" type="button" data-next="explore">进入结构探索 <span>↗</span></button>
            </div>
          </div>
          <div class="paper-headline"><strong>从滚动到推理：两个世纪的机器进化</strong><span>点击时间节点，打开一页历史档案</span></div>
        </div>

        <div class="history-paper-lead">
          <article class="paper-lead-story">
            <span class="timeline-kicker">EDITOR'S NOTE / 开篇</span>
            <h2>先有一只轮子，<br /><em>才有后来的一切。</em></h2>
            <p>汽车看似从发动机开始，实际上更早的转折发生在轮子与轴被组合的那一刻。滚动让重量获得了方向，方向又催生出车架、制动、道路和速度。</p>
            <p>AI 的故事也有相似的结构：先把“智能”写成问题，再把问题拆成数据、模型、算力和反馈。汽车与 AI 的相遇，不只是把电脑装进车里，而是让移动系统开始拥有一套感知世界的语言。</p>
            <div class="paper-byline"><span>编辑部观察</span><span>共 15 个节点 · 2 条时间线</span></div>
          </article>
          <figure class="paper-cover-figure">
            <img src="${archiveAssets['轮子改变移动'].image}" alt="${archiveAssets['轮子改变移动'].imageAlt}" loading="eager" />
            <figcaption><span>ARCHIVE IMAGE 01</span>${archiveAssets['轮子改变移动'].caption}</figcaption>
          </figure>
          <aside class="paper-facts">
            <div><span>起点</span><strong>约公元前 3500 年</strong><small>轮子与轴的组合</small></div>
            <div><span>转折</span><strong>1885–1886</strong><small>汽车成为独立机器</small></div>
            <div><span>汇合</span><strong>今天</strong><small>AI 进入真实道路</small></div>
          </aside>
        </div>

      <div class="timeline-stage">
        <div class="timeline-header">
          <div>
            <span class="timeline-kicker">A DOUBLE TIMELINE</span>
            <h2>从移动，到理解</h2>
          </div>
          <p>点击节点，查看一段改变机器的想法。</p>
        </div>
        <div class="timeline-grid">
          <div class="timeline-rail" data-rail="auto">
            <div class="rail-meta"><span class="rail-dot rail-dot--amber"></span><span>汽车 / AUTOMOTIVE</span></div>
            <div class="rail-line"></div>
            <div class="event-list" data-events="auto"></div>
          </div>
          <div class="timeline-rail" data-rail="ai">
            <div class="rail-meta"><span class="rail-dot rail-dot--cyan"></span><span>AI / INTELLIGENCE</span></div>
            <div class="rail-line"></div>
            <div class="event-list" data-events="ai"></div>
          </div>
        </div>
        <div class="timeline-note"><span>—</span> 两条线在今天汇合：机器开始在真实世界里看、想、行动。</div>
      </div>

      <div class="history-archive" data-history-archive>
        <div class="archive-header">
          <div>
            <span class="timeline-kicker">OPEN ARCHIVE / ALL NODES</span>
            <h2>从古至今，<em>全部展开。</em></h2>
          </div>
          <p>不需要打开弹窗。沿着报纸向下滚动，每一个节点都已经写成一篇短档案。</p>
        </div>
        <div class="archive-list" data-history-archive-list></div>
      </div>

      <div class="history-source-strip"><span>档案方法</span><p>时间线里的历史事件来自公开机构、博物馆和 Wikimedia Commons 档案。图片用于帮助建立时代现场感，页面保留原始来源和许可信息；概念节点与具体车型参数会明确区分。</p><span>01 / 02</span></div>

      </div>

      <div class="history-footer">
        <span>SCROLL TO EXPLORE</span>
        <span class="scroll-line"></span>
        <span>01</span>
      </div>
    </section>

    <section class="chapter chapter--explore" id="explore" data-page="explore" aria-hidden="true">
      <div class="explore-workbench">
        <div class="model-viewer" data-model-viewer>
          <canvas id="model-canvas" aria-label="曜境 S9 三维模型交互视图"></canvas>
          <div class="viewer-vignette" aria-hidden="true"></div>
          <div class="viewer-topline"><span>YJ / S9</span><span>LIVE STRUCTURE STUDY</span></div>
          <div class="model-loading" data-model-loading>
            <span class="model-loading__label" data-model-loading-label>正在载入结构数据</span>
            <span class="model-loading__percent" data-model-loading-percent>0%</span>
            <span class="model-loading__bar"><i data-model-loading-bar></i></span>
          </div>
          <div class="model-hint">拖拽旋转 · 滚轮缩放 · 点击右侧模块聚焦</div>
          <div class="model-status" data-model-status>等待模型</div>
          <div class="explode-hud" data-explode-hud aria-hidden="true">
            <span>EXPLODED ASSEMBLY</span><b>24 GROUPS / PICK ANY PART</b>
          </div>
          <div class="adas-overlay" data-adas-overlay aria-hidden="true">
            <div class="adas-overlay__status"><span class="adas-pulse-dot"></span><span>RADAR PULSE / ACTIVE</span></div>
            <div class="adas-overlay__legend"><span><i class="legend-mark legend-mark--cyan"></i>超声波</span><span><i class="legend-mark legend-mark--amber"></i>毫米波雷达</span><span><i class="legend-mark legend-mark--white"></i>目标回波</span></div>
            <div class="adas-overlay__metrics"><div><b data-adas-metric="distance">18.4</b><span>距离 / M</span></div><div><b data-adas-metric="direction">+12°</b><span>方向 / DEG</span></div><div><b data-adas-metric="target">03</b><span>目标 / COUNT</span></div></div>
          </div>
        </div>
        <aside class="explore-panel">
          <div class="explore-panel__intro">
            <p class="eyebrow">CHAPTER 02 / OPEN THE MACHINE</p>
            <h2>把车身打开，<br /><em>看见它如何感知。</em></h2>
            <p>曜境 S9 是一个结构概念模型。选择一个系统，观察它在整车中的位置与作用。</p>
          </div>
          <div class="explore-controls" role="tablist" aria-label="模型结构模块">
            <button class="explore-control is-active" type="button" data-focus="all" role="tab" aria-selected="true"><span>01</span><strong>整车</strong><small>完整结构</small></button>
            <button class="explore-control" type="button" data-focus="battery" role="tab" aria-selected="false"><span>02</span><strong>电池系统</strong><small>能量底座</small></button>
            <button class="explore-control" type="button" data-focus="cabin" role="tab" aria-selected="false"><span>03</span><strong>座舱系统</strong><small>人与机器</small></button>
            <button class="explore-control" type="button" data-focus="adas" role="tab" aria-selected="false"><span>04</span><strong>智驾感知</strong><small>机器的眼睛</small></button>
          </div>
          <div class="model-actions" aria-label="车辆交互控制">
            <button class="model-action" type="button" data-model-action="doors" aria-pressed="false">
              <span class="model-action__glyph">↔</span><span><strong>车门</strong><small data-action-label="doors">打开</small></span>
            </button>
            <button class="model-action" type="button" data-model-action="tailgate" aria-pressed="false">
              <span class="model-action__glyph">↥</span><span><strong>后备箱</strong><small data-action-label="tailgate">打开</small></span>
            </button>
            <button class="model-action" type="button" data-model-action="lights" aria-pressed="false">
              <span class="model-action__glyph">◉</span><span><strong>车灯</strong><small data-action-label="lights">打开</small></span>
            </button>
          </div>
          <div class="explode-controls" aria-label="爆炸图控制">
            <button class="explode-toggle" type="button" data-explode-toggle aria-pressed="false">
              <span class="explode-toggle__eyebrow">STRUCTURE / EXPLODE</span>
              <strong data-explode-label>打开爆炸图</strong>
              <small>按装配层级展开，点击零件查询信息</small>
            </button>
            <button class="explode-reset" type="button" data-explode-reset aria-label="重置爆炸图">↺</button>
          </div>
          <div class="explore-detail" data-focus-detail>
            <div class="explore-detail__index" data-focus-index>SYSTEM 01 / 04</div>
            <h3 data-focus-title>整车结构</h3>
            <p data-focus-copy>先从完整形态观察曜境 S9：外部车身、座舱、电池与感知组件被组织在同一个移动系统里。</p>
            <dl class="explore-facts" data-focus-facts>
              <div><dt>模型</dt><dd>EV SUV</dd></div>
              <div><dt>节点</dt><dd>802</dd></div>
              <div><dt>材质</dt><dd>19 组</dd></div>
            </dl>
          </div>
          <div class="part-inspector" data-part-inspector aria-live="polite" aria-hidden="true">
            <div class="part-inspector__eyebrow">PICKED PART / NODE</div>
            <h3 data-part-name>点击模型中的零件</h3>
            <p data-part-copy>打开爆炸图后，点击任意零件查看它所属的系统与结构作用。</p>
            <dl class="explore-facts" data-part-facts>
              <div><dt>系统</dt><dd>等待选择</dd></div>
              <div><dt>装配</dt><dd>—</dd></div>
              <div><dt>材质</dt><dd>—</dd></div>
            </dl>
          </div>
          <div class="explore-footer"><button class="text-button" type="button" data-next="history">返回共同进化 <span>↗</span></button><span class="model-credit">GLB / CC BY 4.0 + original systems</span></div>
        </aside>
      </div>
      <div class="history-footer"><span>INTERACTIVE MODEL / COMING NEXT</span><span class="scroll-line"></span><span>02</span></div>
    </section>
  </main>
`;

function renderEvents(track: 'auto' | 'ai', events: TimelineEvent[]) {
  const container = document.querySelector<HTMLDivElement>(`[data-events="${track}"]`);
  if (!container) return;
  container.innerHTML = events.map((event, index) => `
    <button class="timeline-event ${index === 0 ? 'is-selected' : ''}" type="button" data-event-index="${index}" data-track="${track}">
      <span class="event-year">${event.year}</span>
      <span class="event-title">${event.title}</span>
      <span class="event-detail">${event.detail}</span>
    </button>
  `).join('');
}

renderEvents('auto', autoEvents);
renderEvents('ai', aiEvents);

function renderArchiveArticles() {
  const container = document.querySelector<HTMLDivElement>('[data-history-archive-list]');
  if (!container) return;
  const entries = [
    ...autoEvents.map((event, index) => ({ event, track: 'auto' as const, index })),
    ...aiEvents.map((event, index) => ({ event, track: 'ai' as const, index })),
  ];
  container.innerHTML = entries.map(({ event, track, index }) => {
    const archive = archiveAssets[event.title];
    const number = String(index + 1).padStart(2, '0');
    const imageMarkup = archive?.image
      ? `<figure class="archive-article__media"><img src="${archive.image}" alt="${archive.imageAlt ?? event.title}" loading="lazy" /><figcaption>${archive.caption ?? ''}</figcaption>${archive.sourceUrl ? `<a href="${archive.sourceUrl}" target="_blank" rel="noreferrer">${archive.credit ?? '查看档案来源'} ↗</a>` : ''}</figure>`
      : `<div class="archive-article__media archive-article__media--empty"><span>ARCHIVE NOTE</span><strong>资料节点</strong><small>本条为概念与研究路线的历史摘要，来源信息保留在右侧。</small></div>`;
    return `
      <article class="archive-article archive-article--${track}" id="archive-${track}-${number}" data-archive-article>
        <div class="archive-article__rail"><span>${track === 'auto' ? 'AUTOMOTIVE' : 'INTELLIGENCE'}</span><b>${number}</b></div>
        <div class="archive-article__body">
          <div class="archive-article__heading"><span class="archive-article__year">${event.year}</span><h3>${event.title}</h3></div>
          <div class="archive-article__grid">
            ${imageMarkup}
            <div class="archive-article__copy">
              <p class="archive-article__detail">${event.detail}</p>
              <div class="archive-article__section"><span>发生了什么</span><p>${event.context}</p></div>
              <div class="archive-article__section"><span>它带来了什么</span><p>${event.impact}</p></div>
              <div class="archive-article__section archive-article__section--story"><span>把故事摊开</span><p>${archive?.story ?? `${event.context} ${event.impact}`}</p></div>
              ${archive?.quote ? `<blockquote>“${archive.quote}”</blockquote>` : ''}
              <div class="archive-article__source"><span>资料来源 / ${event.source}</span>${archive?.sourceUrl ? `<a href="${archive.sourceUrl}" target="_blank" rel="noreferrer">查看图档与许可 ↗</a>` : '<span>概念节点 / 研究史摘要</span>'}</div>
            </div>
          </div>
        </div>
      </article>`;
  }).join('');
}

renderArchiveArticles();

const menu = document.querySelector<HTMLElement>('[data-chapter-menu]');
const menuButton = document.querySelector<HTMLButtonElement>('[data-menu-button]');
const chapterNumber = document.querySelector<HTMLElement>('[data-chapter-number]');
const chapterLabel = document.querySelector<HTMLElement>('[data-chapter-label]');
const menuItems = [...document.querySelectorAll<HTMLButtonElement>('[data-go]')];

const pageMeta: Record<string, { number: string; label: string }> = {
  history: { number: '01', label: '共同进化' },
  explore: { number: '02', label: '打开曜境 S9' },
};

function showPage(page: string) {
  document.querySelectorAll<HTMLElement>('[data-page]').forEach((section) => {
    const active = section.dataset.page === page;
    section.classList.toggle('is-active', active);
    section.setAttribute('aria-hidden', String(!active));
  });
  menuItems.forEach((item) => item.classList.toggle('is-active', item.dataset.go === page));
  if (chapterNumber) chapterNumber.textContent = pageMeta[page].number;
  if (chapterLabel) chapterLabel.textContent = pageMeta[page].label;
  menu?.classList.remove('is-open');
  menuButton?.classList.remove('is-open');
  window.history.replaceState({}, '', `#${page}`);
  window.scrollTo({ top: 0, behavior: 'auto' });
}

menuButton?.addEventListener('click', () => {
  menu?.classList.toggle('is-open');
  menuButton.classList.toggle('is-open');
});

document.querySelectorAll<HTMLElement>('[data-next]').forEach((button) => {
  button.addEventListener('click', () => showPage(button.dataset.next ?? 'history'));
});

menuItems.forEach((item) => item.addEventListener('click', () => showPage(item.dataset.go ?? 'history')));

function updateDossier(event: TimelineEvent, track: 'auto' | 'ai', index: number) {
  const archive = archiveAssets[event.title];
  const count = String(index + 1).padStart(2, '0');
  document.querySelector<HTMLElement>('[data-dossier-title]')?.replaceChildren(document.createTextNode(event.title));
  document.querySelector<HTMLElement>('[data-dossier-track]')?.replaceChildren(document.createTextNode(`${track === 'auto' ? 'AUTOMOTIVE' : 'INTELLIGENCE'} / ${count}`));
  document.querySelector<HTMLElement>('[data-dossier-year]')?.replaceChildren(document.createTextNode(event.year));
  document.querySelector<HTMLElement>('[data-dossier-detail]')?.replaceChildren(document.createTextNode(event.detail));
  document.querySelector<HTMLElement>('[data-dossier-context]')?.replaceChildren(document.createTextNode(event.context));
  document.querySelector<HTMLElement>('[data-dossier-impact]')?.replaceChildren(document.createTextNode(event.impact));
  document.querySelector<HTMLElement>('[data-dossier-source]')?.replaceChildren(document.createTextNode(event.source));
  document.querySelector<HTMLElement>('[data-dossier-story]')?.replaceChildren(document.createTextNode(archive?.story ?? `${event.context} ${event.impact}`));
  const quote = document.querySelector<HTMLElement>('[data-dossier-quote]');
  if (quote) {
    quote.textContent = archive?.quote ? `“${archive.quote}”` : '';
    quote.classList.toggle('is-empty', !archive?.quote);
  }
  const media = document.querySelector<HTMLElement>('[data-dossier-media]');
  const image = document.querySelector<HTMLImageElement>('[data-dossier-image]');
  const caption = document.querySelector<HTMLElement>('[data-dossier-caption]');
  const sourceLink = document.querySelector<HTMLAnchorElement>('[data-dossier-source-link]');
  if (media && image && archive?.image) {
    media.classList.remove('is-empty');
    image.src = archive.image;
    image.alt = archive.imageAlt ?? event.title;
    if (caption) caption.textContent = archive.caption ?? '';
    if (sourceLink) {
      sourceLink.href = archive.sourceUrl ?? '#';
      sourceLink.textContent = archive.credit ?? '查看档案来源';
    }
  } else {
    media?.classList.add('is-empty');
  }
  document.querySelector<HTMLElement>('[data-history-dossier]')?.classList.remove('is-updated');
  requestAnimationFrame(() => document.querySelector<HTMLElement>('[data-history-dossier]')?.classList.add('is-updated'));
}

document.querySelectorAll<HTMLButtonElement>('.timeline-event').forEach((eventButton) => {
  eventButton.addEventListener('click', () => {
    const track = eventButton.dataset.track as 'auto' | 'ai';
    document.querySelectorAll<HTMLButtonElement>(`.timeline-event[data-track="${track}"]`).forEach((button) => button.classList.remove('is-selected'));
    eventButton.classList.add('is-selected');
    const index = Number(eventButton.dataset.eventIndex ?? 0);
    const archiveId = `archive-${track}-${String(index + 1).padStart(2, '0')}`;
    document.getElementById(archiveId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

showPage(window.location.hash === '#explore' ? 'explore' : 'history');

type FocusKey = 'all' | 'battery' | 'cabin' | 'adas';

const focusCopy: Record<FocusKey, { index: string; title: string; copy: string; facts: [string, string][] }> = {
  all: { index: 'SYSTEM 01 / 04', title: '整车结构', copy: '先从完整形态观察曜境 S9：外部车身、座舱、电池与感知组件被组织在同一个移动系统里。', facts: [['模型', 'EV SUV'], ['节点', '802'], ['材质', '19 组']] },
  battery: { index: 'SYSTEM 02 / 04', title: '电池系统', copy: '电池包位于车身下方，是纯电平台的能量底座。模型中的 12 模块布局用于解释包装关系，不代表量产容量或化学体系。', facts: [['位置', '底盘中央'], ['模块', '12 个示意模块'], ['作用', '储能 / 供电']] },
  cabin: { index: 'SYSTEM 03 / 04', title: '座舱系统', copy: '座舱把人的输入转化为机器可以执行的指令：座椅、显示器、方向盘和内饰结构共同形成一个人机界面。', facts: [['区域', '前后排座舱'], ['界面', '显示 / 操控'], ['目标', '理解与响应']] },
  adas: { index: 'SYSTEM 04 / 04', title: '智驾感知', copy: '摄像头、雷达与光学窗口构成车辆的感知层。波纹从车身上的传感器向外扩散，模拟它如何测量距离、方向和目标回波，再把环境交给计算系统判断。', facts: [['输入', '光学 / 距离'], ['波形', '超声 / 雷达'], ['状态', '扫描中']] },
};

const assemblyInfo: Record<string, { label: string; system: string; description: string }> = {
  ADAS: { label: '智驾感知装配', system: '感知系统', description: '摄像头、激光雷达和超声波传感器共同构成车辆的环境输入层。' },
  BatteryPack: { label: '动力电池包', system: '能源系统', description: '位于底盘中央的电池包，为电机和高压附件提供储能与供电。' },
  BodyStructure: { label: '车身结构', system: '承载系统', description: '车身骨架连接悬架、座舱和外覆盖件，承担载荷传递与碰撞路径。' },
  Brakes: { label: '制动系统', system: '底盘系统', description: '制动执行器、液压管路与制动机构共同完成减速和停车。' },
  Cabin: { label: '座舱系统', system: '人机系统', description: '座椅、显示器、方向盘和内饰结构把人的输入转换为可执行指令。' },
  ChargeHV: { label: '高压充电系统', system: '能源系统', description: '充电接口和高压连接件把外部电能安全送入动力电池。' },
  Door_FL: { label: '左前车门', system: '车身开合件', description: '包含车门外板、内饰卡板、玻璃和铰链，是前排乘员的进出界面。' },
  Door_FR: { label: '右前车门', system: '车身开合件', description: '包含车门外板、内饰卡板、玻璃和铰链，是前排乘员的进出界面。' },
  Door_RL: { label: '左后车门', system: '车身开合件', description: '后排乘员入口与侧围结构的可动覆盖件。' },
  Door_RR: { label: '右后车门', system: '车身开合件', description: '后排乘员入口与侧围结构的可动覆盖件。' },
  Exterior: { label: '外饰覆盖', system: '车身外观', description: '外板、灯具开口和装饰件共同形成车辆的可见外轮廓。' },
  FrontEaxle: { label: '前电驱桥', system: '电驱系统', description: '前部电机、减速机构与高压接口组成前轴驱动单元。' },
  FrontSuspension: { label: '前悬架', system: '底盘系统', description: '前轮悬架控制车轮跳动、转向响应和车身支撑。' },
  Hood: { label: '前舱盖', system: '车身开合件', description: '覆盖前舱并通过铰链与车身连接的可动外板。' },
  RearEaxle: { label: '后电驱桥', system: '电驱系统', description: '后部电机、减速机构与高压接口组成后轴驱动单元。' },
  RearSuspension: { label: '后悬架', system: '底盘系统', description: '后轮悬架负责车轮定位、路面隔离和车身稳定。' },
  RoofGlazing: { label: '车顶玻璃', system: '车身外观', description: '车顶采光和玻璃结构，连接车顶开口与乘员视野。' },
  Steering: { label: '转向系统', system: '底盘系统', description: '方向盘、转向柱和转向执行件把驾驶者输入传递到前轮。' },
  Tailgate: { label: '后备箱尾门', system: '车身开合件', description: '后部电动尾门及其铰链、撑杆和内衬，提供行李舱开口。' },
  ThermalHVAC: { label: '热管理与空调', system: '热管理系统', description: '热交换、冷却和空调部件调节电池、座舱与电驱系统的温度。' },
  Wheel_FL: { label: '左前车轮', system: '底盘系统', description: '轮胎、轮辋和轮毂组件，把悬架运动转换为路面接触。' },
  Wheel_FR: { label: '右前车轮', system: '底盘系统', description: '轮胎、轮辋和轮毂组件，把悬架运动转换为路面接触。' },
  Wheel_RL: { label: '左后车轮', system: '底盘系统', description: '轮胎、轮辋和轮毂组件，把悬架运动转换为路面接触。' },
  Wheel_RR: { label: '右后车轮', system: '底盘系统', description: '轮胎、轮辋和轮毂组件，把悬架运动转换为路面接触。' },
};

const fallbackExplodeVectors: Record<string, [number, number, number]> = {
  ADAS: [0, 1.2, 0], BatteryPack: [0, -0.9, 0], BodyStructure: [0, -0.45, 0], Brakes: [0.85, 0.28, 0.4], Cabin: [0, 0.95, 0], ChargeHV: [-0.8, -0.3, 0.45],
  Door_FL: [0, 0, -0.9], Door_FR: [0, 0, 0.9], Door_RL: [0, 0, -0.9], Door_RR: [0, 0, 0.9], Exterior: [0, 0.9, 0], FrontEaxle: [1.05, 0, 0], FrontSuspension: [0.65, 0, 0], Hood: [0.55, 0.65, 0], RearEaxle: [-1.05, 0, 0], RearSuspension: [-0.65, 0, 0], RoofGlazing: [0, 1.35, 0], Steering: [0.55, 0.35, 0], Tailgate: [-0.8, 0.75, 0], ThermalHVAC: [1.1, -0.25, 0.65], Wheel_FL: [0, 0, -1.05], Wheel_FR: [0, 0, 1.05], Wheel_RL: [0, 0, -1.05], Wheel_RR: [0, 0, 1.05],
};

const humanizeNodeName = (name: string) => name.replace(/[_-]+/g, ' ').replace(/\b\d+\b/g, '').replace(/\s+/g, ' ').trim() || '未命名零件';

function setupModelExplorer() {
  const canvas = document.querySelector<HTMLCanvasElement>('#model-canvas');
  const viewer = document.querySelector<HTMLElement>('[data-model-viewer]');
  if (!canvas || !viewer) return;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#e0e4e1');
  scene.add(new THREE.HemisphereLight(0xf4f7f4, 0x9da8a3, 2.1));
  const key = new THREE.DirectionalLight(0xffd4a3, 3.4);
  key.position.set(4, 7, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x8ad9d1, 2.2);
  rim.position.set(-5, 3, -4);
  scene.add(rim);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  const mobile = matchMedia('(max-width: 760px)').matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.35 : 1.8));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const camera = new THREE.PerspectiveCamera(34, 1, 0.01, 100);
  camera.position.set(4.5, 2.5, 5.4);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 2.2;
  controls.maxDistance = 10;
  controls.target.set(0, 0.75, 0);
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.45;

  const grid = new THREE.GridHelper(18, 36, 0x6a8580, 0xaeb9b5);
  grid.position.y = -0.92;
  grid.material.opacity = 0.24;
  grid.material.transparent = true;
  scene.add(grid);

  const loading = document.querySelector<HTMLElement>('[data-model-loading]');
  const loadingLabel = document.querySelector<HTMLElement>('[data-model-loading-label]');
  const loadingPercent = document.querySelector<HTMLElement>('[data-model-loading-percent]');
  const loadingBar = document.querySelector<HTMLElement>('[data-model-loading-bar]');
  const modelStatus = document.querySelector<HTMLElement>('[data-model-status]');
  let modelRoot: THREE.Object3D | null = null;
  let activeFocus: FocusKey = 'all';
  const focusMaterials = new Set<THREE.Material>();
  const materialCache = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();
  const visibilityCache = new Map<THREE.Object3D, boolean>();
  const homeCameraPosition = new THREE.Vector3();
  const homeCameraTarget = new THREE.Vector3();
  const homeMinDistance = controls.minDistance;
  const homeMaxDistance = controls.maxDistance;
  type WaveNode = { mesh: THREE.Mesh; phase: number; duration: number; maxScale: number; baseOpacity: number };
  type SensorPoint = { mesh: THREE.Mesh; phase: number };
  const waveNodes: WaveNode[] = [];
  const sensorPoints: SensorPoint[] = [];
  const waveClock = new THREE.Clock();
  let sensorWaveGroup: THREE.Group | null = null;
  type DoorRig = { node: THREE.Object3D; direction: number; baseRotation: number };
  const doorRigs: DoorRig[] = [];
  let tailgateRig: { node: THREE.Object3D; baseRotation: number } | null = null;
  let doorsOpen = 0;
  let doorsOpenTarget = 0;
  let tailgateOpen = 0;
  let tailgateOpenTarget = 0;
  let lightsOn = false;
  type ExplosionRig = { node: THREE.Object3D; basePosition: THREE.Vector3; offset: THREE.Vector3; baseBox: THREE.Box3; key: string };
  const explosionRigs: ExplosionRig[] = [];
  let assemblyRoot: THREE.Object3D | null = null;
  let explosionProgress = 0;
  let explosionTarget = 0;
  const explosionRaycaster = new THREE.Raycaster();
  const explosionPointer = new THREE.Vector2();
  const selectionMaterialCache = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();
  let selectedPartMesh: THREE.Mesh | null = null;

  const createRadarWave = (group: THREE.Group, position: THREE.Vector3, rotation: THREE.Euler, color: number, maxRadius: number, phase: number, duration: number, ellipse = 1) => {
    const geometry = new THREE.RingGeometry(0.06, 0.085, 64);
    const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.rotation.copy(rotation);
    mesh.scale.set(0.1, 0.1 * ellipse, 0.1);
    mesh.renderOrder = 20;
    group.add(mesh);
    waveNodes.push({ mesh, phase, duration, maxScale: maxRadius / 0.085, baseOpacity: color === 0xe9b56d ? 0.58 : 0.48 });
  };

  const createSensorPoint = (group: THREE.Group, position: THREE.Vector3, color: number, phase: number) => {
    const geometry = new THREE.SphereGeometry(0.045, 12, 8);
    const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.renderOrder = 21;
    group.add(mesh);
    sensorPoints.push({ mesh, phase });
  };

  const resetRadarWaves = () => {
    waveNodes.forEach((wave) => { wave.phase = (wave.phase * 0.37) % 1; });
    sensorPoints.forEach((point) => { point.phase = (point.phase * 0.61) % 1; });
  };

  const updateRadarWaves = (deltaSeconds: number) => {
    if (!sensorWaveGroup?.visible) return;
    waveNodes.forEach((wave) => {
      wave.phase = (wave.phase + deltaSeconds / wave.duration) % 1;
      const progress = wave.phase;
      const eased = progress * progress * (3 - 2 * progress);
      const scale = 0.12 + eased * wave.maxScale;
      wave.mesh.scale.set(scale, scale, scale);
      const fadeIn = Math.min(progress * 8, 1);
      const fadeOut = Math.pow(1 - progress, 1.2);
      (wave.mesh.material as THREE.MeshBasicMaterial).opacity = wave.baseOpacity * fadeIn * fadeOut;
    });
    sensorPoints.forEach((point) => {
      point.phase = (point.phase + deltaSeconds * 0.9) % 1;
      const pulse = 1 + Math.sin(point.phase * Math.PI * 2) * 0.22;
      point.mesh.scale.setScalar(pulse);
      (point.mesh.material as THREE.MeshBasicMaterial).opacity = 0.55 + (pulse - 0.78) * 0.8;
    });
  };

  const updateLoading = (value: number, label?: string) => {
    const progress = Math.max(0, Math.min(100, Math.round(value)));
    if (loadingPercent) loadingPercent.textContent = `${progress}%`;
    if (loadingBar) loadingBar.style.width = `${progress}%`;
    if (loadingLabel && label) loadingLabel.textContent = label;
  };

  const applyBlackVehicleFinish = (material: THREE.Material) => {
    if (material.name.toLowerCase() !== 'paint_multicoat') return;
    if (!(material instanceof THREE.MeshPhysicalMaterial)) return;
    material.color.set('#080a0a');
    material.metalness = 0.52;
    material.roughness = 0.24;
    material.clearcoat = 0.36;
    material.clearcoatRoughness = 0.16;
  };

  const applyLightStateToMaterial = (material: THREE.Material) => {
    const name = material.name.toLowerCase();
    const isHeadlight = name.includes('daylight_led') || name.includes('daylight');
    const isTailLight = name.includes('tail_optics_red') || name.includes('tail_optics');
    if (!isHeadlight && !isTailLight) return;
    if (!(material instanceof THREE.MeshStandardMaterial)) return;
    material.emissiveIntensity = lightsOn ? (isTailLight ? 2.1 : 1.7) : 0.06;
  };

  const applyLightState = () => {
    materialCache.forEach((material) => {
      const materials = Array.isArray(material) ? material : [material];
      materials.forEach(applyLightStateToMaterial);
    });
    modelRoot?.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach(applyLightStateToMaterial);
    });
  };

  const clearSelectedPart = () => {
    selectionMaterialCache.forEach((material, mesh) => { mesh.material = material; });
    selectionMaterialCache.clear();
    selectedPartMesh = null;
    const inspector = document.querySelector<HTMLElement>('[data-part-inspector]');
    inspector?.classList.remove('is-visible');
    inspector?.setAttribute('aria-hidden', 'true');
  };

  const highlightPart = (mesh: THREE.Mesh) => {
    clearSelectedPart();
    const source = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const highlighted = source.map((material) => {
      const copy = material.clone();
      if (copy instanceof THREE.MeshStandardMaterial) {
        copy.emissive.set('#20b8ad');
        copy.emissiveIntensity = 0.7;
      }
      copy.transparent = true;
      return copy;
    });
    selectionMaterialCache.set(mesh, mesh.material);
    mesh.material = Array.isArray(mesh.material) ? highlighted : highlighted[0];
    selectedPartMesh = mesh;
  };

  const showPartInspector = (mesh: THREE.Mesh, assembly: THREE.Object3D) => {
    const info = assemblyInfo[assembly.name] ?? { label: humanizeNodeName(assembly.name), system: '结构零件', description: '该零件属于曜境 S9 的结构概念模型，用于展示系统之间的连接关系。' };
    const inspector = document.querySelector<HTMLElement>('[data-part-inspector]');
    const name = document.querySelector<HTMLElement>('[data-part-name]');
    const copy = document.querySelector<HTMLElement>('[data-part-copy]');
    const facts = document.querySelector<HTMLElement>('[data-part-facts]');
    const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    if (name) name.textContent = humanizeNodeName(mesh.name) || info.label;
    if (copy) copy.textContent = `${info.description} 当前选中：${info.label}。`;
    if (facts) facts.innerHTML = [['系统', info.system], ['装配', info.label], ['材质', material?.name || '未命名材质']].map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join('');
    inspector?.classList.add('is-visible');
    inspector?.setAttribute('aria-hidden', 'false');
    highlightPart(mesh);
  };

  const pickModelPart = (event: PointerEvent) => {
    if (!assemblyRoot) return;
    const rect = canvas.getBoundingClientRect();
    explosionPointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    explosionPointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    explosionRaycaster.setFromCamera(explosionPointer, camera);
    const hit = explosionRaycaster.intersectObject(assemblyRoot, true).find((item) => item.object instanceof THREE.Mesh);
    if (!hit || !(hit.object instanceof THREE.Mesh)) return;
    let assembly: THREE.Object3D = hit.object;
    while (assembly.parent && assembly.parent !== assemblyRoot) assembly = assembly.parent;
    showPartInspector(hit.object, assembly);
  };

  const updateModelActions = (deltaSeconds: number) => {
    doorsOpen = THREE.MathUtils.damp(doorsOpen, doorsOpenTarget, 8, deltaSeconds);
    tailgateOpen = THREE.MathUtils.damp(tailgateOpen, tailgateOpenTarget, 8, deltaSeconds);
    doorRigs.forEach(({ node, direction, baseRotation }) => {
      node.rotation.y = baseRotation + direction * doorsOpen * 0.72;
    });
    if (tailgateRig) {
      tailgateRig.node.rotation.z = tailgateRig.baseRotation - tailgateOpen * 0.95;
    }
  };

  const setExplosionProgress = (progress: number) => {
    explosionRigs.forEach((rig) => {
      rig.node.position.copy(rig.basePosition).addScaledVector(rig.offset, progress);
    });
    assemblyRoot?.updateMatrixWorld(true);
  };

  const prepareExplosionRigs = () => {
    if (!modelRoot) return;
    assemblyRoot = modelRoot.getObjectByName('EV_SUV') ?? modelRoot.children.find((child) => child.name === 'EV_SUV') ?? null;
    if (!assemblyRoot) return;
    assemblyRoot.updateMatrixWorld(true);
    explosionRigs.length = 0;
    assemblyRoot.children.forEach((node) => {
      if (!node.name || node === sensorWaveGroup) return;
      const raw = (node.userData as { explode_vector_blender_m?: number[] } | undefined)?.explode_vector_blender_m;
      const fallback = fallbackExplodeVectors[node.name] ?? [0, 0.7, 0];
      const vector = new THREE.Vector3(
        Number(raw?.[0] ?? fallback[0]),
        Number(raw?.[1] ?? fallback[1]),
        Number(raw?.[2] ?? fallback[2]),
      ).multiplyScalar(1.55);
      explosionRigs.push({ node, basePosition: node.position.clone(), offset: vector, baseBox: new THREE.Box3().setFromObject(node), key: node.name });
    });

    // Use the authored vectors first, then push overlapping assembly boxes apart.
    // The correction runs once, so the animation remains cheap while its final state is separated.
    for (let round = 0; round < 7; round += 1) {
      setExplosionProgress(1);
      const boxes = explosionRigs.map((rig) => new THREE.Box3().setFromObject(rig.node));
      let corrected = false;
      for (let i = 0; i < explosionRigs.length; i += 1) {
        for (let j = i + 1; j < explosionRigs.length; j += 1) {
          const first = boxes[i];
          const second = boxes[j];
          if (!first.intersectsBox(second)) continue;
          const firstCenter = first.getCenter(new THREE.Vector3());
          const secondCenter = second.getCenter(new THREE.Vector3());
          const delta = firstCenter.sub(secondCenter);
          const axis = Math.abs(delta.x) > Math.abs(delta.y) && Math.abs(delta.x) > Math.abs(delta.z) ? 'x' : Math.abs(delta.y) > Math.abs(delta.z) ? 'y' : 'z';
          const firstMin = first.min[axis];
          const firstMax = first.max[axis];
          const secondMin = second.min[axis];
          const secondMax = second.max[axis];
          const overlap = Math.min(firstMax, secondMax) - Math.max(firstMin, secondMin) + 0.1;
          if (overlap <= 0) continue;
          const sign = delta[axis] === 0 ? (i % 2 === 0 ? 1 : -1) : Math.sign(delta[axis]);
          const correction = overlap / Math.max(modelRoot.scale.x, 0.0001) * 0.55;
          const push = new THREE.Vector3();
          push[axis] = sign * correction;
          explosionRigs[i].offset.add(push);
          explosionRigs[j].offset.sub(push);
          corrected = true;
        }
      }
      if (!corrected) break;
    }
    setExplosionProgress(0);
  };

  const updateExplosion = (deltaSeconds: number) => {
    explosionProgress = THREE.MathUtils.damp(explosionProgress, explosionTarget, 5.5, deltaSeconds);
    setExplosionProgress(explosionProgress);
  };

  const loader = new GLTFLoader();
  loader.load('/assets/yaojing-s9.glb', (gltf) => {
    modelRoot = gltf.scene;
    modelRoot.rotation.y = Math.PI * 0.08;
    modelRoot.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = false;
        object.receiveShadow = false;
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach(applyBlackVehicleFinish);
        materialCache.set(object, object.material);
      }
      visibilityCache.set(object, object.visible);
    });
    const registerDoor = (name: string, direction: number) => {
      const node = modelRoot?.getObjectByName(name);
      if (node) doorRigs.push({ node, direction, baseRotation: node.rotation.y });
    };
    registerDoor('Door_FL', -1);
    registerDoor('Door_RL', -1);
    registerDoor('Door_FR', 1);
    registerDoor('Door_RR', 1);
    const tailgateNode = modelRoot.getObjectByName('Tailgate');
    if (tailgateNode) tailgateRig = { node: tailgateNode, baseRotation: tailgateNode.rotation.z };
    applyLightState();
    const bounds = new THREE.Box3().setFromObject(modelRoot);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    modelRoot.position.sub(center);
    modelRoot.position.y += size.y * 0.5;
    const maxSize = Math.max(size.x, size.y, size.z);
    const scale = 3.7 / maxSize;
    modelRoot.scale.setScalar(scale);
    scene.add(modelRoot);
    sensorWaveGroup = new THREE.Group();
    sensorWaveGroup.name = 'ADAS_RADAR_WAVE_FIELD';
    sensorWaveGroup.visible = false;
    sensorWaveGroup.renderOrder = 20;
    modelRoot.add(sensorWaveGroup);
    // Align the effect to the authored sensor nodes instead of estimating from the car bounds.
    // The exported GLB is Y-up: X = front/back, Z = left/right.
    modelRoot.updateMatrixWorld(true);
    const sensorAnchor = (names: string[], fallback: THREE.Vector3) => {
      const node = names.map((name) => modelRoot?.getObjectByName(name)).find(Boolean);
      if (!node || !modelRoot) return fallback;
      const worldPosition = node.getWorldPosition(new THREE.Vector3());
      return modelRoot.worldToLocal(worldPosition);
    };
    const roofSensor = sensorAnchor(['Lidar_optical_window', 'Roof_lidar_housing'], new THREE.Vector3(0, size.y * 0.53, 0));
    const frontSensor = sensorAnchor(['Front_camera_optic', 'Closed_EV_sensor_fascia'], new THREE.Vector3(size.x * 0.47, size.y * 0.18, 0));
    const leftSensor = sensorAnchor(['Left_camera_optic'], new THREE.Vector3(size.x * 0.02, size.y * 0.28, size.z * 0.5));
    const rightSensor = sensorAnchor(['Right_camera_optic'], new THREE.Vector3(size.x * 0.02, size.y * 0.28, -size.z * 0.5));
    createSensorPoint(sensorWaveGroup, roofSensor, 0xe9b56d, 0.15);
    createSensorPoint(sensorWaveGroup, frontSensor, 0x91d8d0, 0.42);
    createSensorPoint(sensorWaveGroup, leftSensor, 0x91d8d0, 0.66);
    createSensorPoint(sensorWaveGroup, rightSensor, 0x91d8d0, 0.84);
    [0, 0.33, 0.66].forEach((phase) => createRadarWave(sensorWaveGroup!, roofSensor, new THREE.Euler(Math.PI / 2, 0, 0), 0xe9b56d, size.z * 0.42, phase, 2.35, 1));
    [0, 0.34, 0.68].forEach((phase) => createRadarWave(sensorWaveGroup!, frontSensor, new THREE.Euler(0, Math.PI / 2, 0), 0x91d8d0, size.y * 0.52, phase, 1.65, 0.48));
    [0.12, 0.58].forEach((phase) => createRadarWave(sensorWaveGroup!, leftSensor, new THREE.Euler(0, 0, 0), 0x91d8d0, size.y * 0.32, phase, 1.25, 0.66));
    [0.35, 0.81].forEach((phase) => createRadarWave(sensorWaveGroup!, rightSensor, new THREE.Euler(0, 0, 0), 0x91d8d0, size.y * 0.32, phase, 1.25, 0.66));
    prepareExplosionRigs();
    controls.target.set(0, size.y * scale * 0.38, 0);
    controls.update();
    homeCameraPosition.copy(camera.position);
    homeCameraTarget.copy(controls.target);
    updateLoading(100, '结构数据已载入');
    loading?.classList.add('is-complete');
    if (modelStatus) modelStatus.textContent = 'LIVE / READY';
    setFocus(activeFocus);
  }, (event) => {
    const total = event.total || 0;
    updateLoading(total > 0 ? event.loaded / total * 100 : 36, total > 0 ? '正在载入结构数据' : '正在解析结构数据');
  }, () => {
    updateLoading(100, '模型载入失败');
    if (modelStatus) modelStatus.textContent = 'LOAD ERROR';
  });

  const focusRoots: Record<Exclude<FocusKey, 'all'>, string[]> = {
    battery: ['BatteryPack'],
    cabin: ['Cabin'],
    adas: ['ADAS'],
  };
  const isVehicleLightObject = (node: THREE.Object3D) => {
    let current: THREE.Object3D | null = node;
    while (current) {
      const nodeName = current.name.toLowerCase();
      if (/(tail|headlight|head_light|headlamp|lamp|light|brake|turnsignal|turn_signal|indicator|fog)/.test(nodeName)) return true;
      current = current.parent;
    }
    return false;
  };

  const isCabinBackgroundObject = (node: THREE.Object3D) => {
    let current: THREE.Object3D | null = node;
    while (current) {
      const nodeName = current.name.toLowerCase();
      if (/(^door(?:_|$)|glass|sill|pillar|luggage|wheelhouse|roofglazing|roof_glazing|bodystructure|exterior|paint|tailgate|hood|bumper|fender|quarter_panel)/.test(nodeName)) return true;
      current = current.parent;
    }
    return false;
  };

  const categoryForObject = (object: THREE.Object3D, key: Exclude<FocusKey, 'all'>) => {
    const rootNames = focusRoots[key];
    const name = object.name.toLowerCase();

    // Light assemblies are part of the vehicle shell, but they are not ADAS
    // hardware. Keep them out of the sensing layer so their emissive materials
    // cannot compete with the radar/ultrasonic overlays.
    if (key === 'adas' && isVehicleLightObject(object)) return false;
    if (key === 'cabin' && isCabinBackgroundObject(object)) return false;

    let current: THREE.Object3D | null = object;
    while (current) {
      if (rootNames.includes(current.name)) return true;
      current = current.parent;
    }
    if (key === 'battery') return /battery|hv_|coolant|module|pack/.test(name);
    if (key === 'cabin') return /cabin|seat_|console|display|screen|dashboard|steering|air_outlet|armrest|footwell|carpet|pedal|airbag|phone_charging|cupwell/.test(name);
    return /adas|lidar|camera|radar|sensor|driver_display|center_display/.test(name);
  };

  const fitFocusCamera = (focus: FocusKey) => {
    if (!modelRoot) return;
    if (focus === 'all') {
      camera.position.copy(homeCameraPosition);
      controls.target.copy(homeCameraTarget);
      controls.minDistance = homeMinDistance;
      controls.maxDistance = homeMaxDistance;
      controls.update();
      return;
    }
    const rootName = focus === 'battery' ? 'BatteryPack' : focus === 'cabin' ? 'Cabin' : 'ADAS';
    const focusRoot = modelRoot.getObjectByName(rootName);
    if (!focusRoot) return;
    const bounds = new THREE.Box3().setFromObject(focusRoot);
    if (bounds.isEmpty()) return;
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    const maxDimension = Math.max(size.x, size.y, size.z);
    const direction = camera.position.clone().sub(controls.target).normalize();
    const distance = Math.max(maxDimension * (focus === 'battery' ? 1.9 : 1.65), 3.2);
    camera.position.copy(center).add(direction.multiplyScalar(distance));
    controls.target.copy(center);
    controls.minDistance = Math.max(1.2, maxDimension * 0.65);
    controls.maxDistance = Math.max(8, maxDimension * 4.5);
    controls.update();
  };

  const restoreMaterials = () => {
    materialCache.forEach((material, mesh) => { mesh.material = material; });
    visibilityCache.forEach((visible, object) => { object.visible = visible; });
    focusMaterials.forEach((material) => material.dispose());
    focusMaterials.clear();
  };

  const setFocus = (focus: FocusKey) => {
    activeFocus = focus;
    clearSelectedPart();
    if (modelRoot) {
      restoreMaterials();
    }
    if (modelRoot && focus !== 'all') {
      modelRoot.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        // The wave field owns its materials and animation state. It is toggled
        // separately below and should not be dimmed as part of the car focus.
        if (sensorWaveGroup?.getObjectById(object.id)) return;
        const selected = categoryForObject(object, focus);
        const isVehicleLight = isVehicleLightObject(object);
        const isCabinBackground = focus === 'cabin' && isCabinBackgroundObject(object);
        const source = Array.isArray(object.material) ? object.material : [object.material];
        const cloned = source.map((material) => {
          const copy = material.clone();
          copy.transparent = true;
          copy.opacity = focus === 'adas' && isVehicleLight
            ? 0
            : focus === 'cabin'
              ? isCabinBackground
                ? 0.012
                : selected
                  ? 1
                  : 0.03
              : selected
                ? 1
                : 0.08;
          if (!selected || isCabinBackground) copy.depthWrite = false;
          if (focus === 'adas' && isVehicleLight && 'emissive' in copy) {
            const emissiveMaterial = copy as THREE.MeshStandardMaterial;
            emissiveMaterial.emissive.set(0x000000);
            emissiveMaterial.emissiveIntensity = 0;
          }
          focusMaterials.add(copy);
          return copy;
        });
        object.visible = !(focus === 'adas' && isVehicleLight);
        object.material = Array.isArray(object.material) ? cloned : cloned[0];
      });
    }
    const data = focusCopy[focus];
    const adasOverlay = document.querySelector<HTMLElement>('[data-adas-overlay]');
    const isAdas = focus === 'adas';
    sensorWaveGroup?.visible && !isAdas && (sensorWaveGroup.visible = false);
    if (sensorWaveGroup && isAdas) {
      sensorWaveGroup.visible = true;
      resetRadarWaves();
    }
    adasOverlay?.classList.toggle('is-visible', isAdas);
    adasOverlay?.setAttribute('aria-hidden', String(!isAdas));
    if (modelStatus) modelStatus.textContent = isAdas ? 'SENSORS / SCANNING' : 'LIVE / READY';
    fitFocusCamera(focus);
    document.querySelector<HTMLElement>('[data-focus-index]')?.replaceChildren(document.createTextNode(data.index));
    const title = document.querySelector<HTMLElement>('[data-focus-title]');
    const copy = document.querySelector<HTMLElement>('[data-focus-copy]');
    const facts = document.querySelector<HTMLElement>('[data-focus-facts]');
    if (title) title.textContent = data.title;
    if (copy) copy.textContent = data.copy;
    if (facts) facts.innerHTML = data.facts.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join('');
  };

  document.querySelectorAll<HTMLButtonElement>('[data-focus]').forEach((button) => {
    button.addEventListener('click', () => {
      const focus = (button.dataset.focus ?? 'all') as FocusKey;
      document.querySelectorAll<HTMLButtonElement>('[data-focus]').forEach((item) => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-selected', String(active));
      });
      setFocus(focus);
    });
  });

  const updateActionButton = (action: string, isActive: boolean) => {
    const button = document.querySelector<HTMLButtonElement>(`[data-model-action="${action}"]`);
    const label = document.querySelector<HTMLElement>(`[data-action-label="${action}"]`);
    button?.classList.toggle('is-active', isActive);
    button?.setAttribute('aria-pressed', String(isActive));
    if (label) label.textContent = isActive ? '关闭' : '打开';
  };

  document.querySelectorAll<HTMLButtonElement>('[data-model-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.modelAction;
      if (action === 'doors') {
        doorsOpenTarget = doorsOpenTarget > 0.5 ? 0 : 1;
        updateActionButton(action, doorsOpenTarget > 0.5);
      }
      if (action === 'tailgate') {
        tailgateOpenTarget = tailgateOpenTarget > 0.5 ? 0 : 1;
        updateActionButton(action, tailgateOpenTarget > 0.5);
      }
      if (action === 'lights') {
        lightsOn = !lightsOn;
        applyLightState();
        updateActionButton(action, lightsOn);
        setFocus(activeFocus);
      }
    });
  });

  const explodeToggle = document.querySelector<HTMLButtonElement>('[data-explode-toggle]');
  const explodeReset = document.querySelector<HTMLButtonElement>('[data-explode-reset]');
  const explodeLabel = document.querySelector<HTMLElement>('[data-explode-label]');
  const explodeHud = document.querySelector<HTMLElement>('[data-explode-hud]');
  const setExploded = (open: boolean) => {
    explosionTarget = open ? 1 : 0;
    explodeToggle?.classList.toggle('is-active', open);
    explodeToggle?.setAttribute('aria-pressed', String(open));
    if (explodeLabel) explodeLabel.textContent = open ? '关闭爆炸图' : '打开爆炸图';
    explodeHud?.classList.toggle('is-visible', open);
    explodeHud?.setAttribute('aria-hidden', String(!open));
    if (!open) clearSelectedPart();
  };
  explodeToggle?.addEventListener('click', () => setExploded(explosionTarget < 0.5));
  explodeReset?.addEventListener('click', () => setExploded(false));
  canvas.addEventListener('pointerup', (event) => {
    if (explosionTarget > 0.1 || explosionProgress > 0.1) pickModelPart(event);
  });

  const resize = () => {
    const width = viewer.clientWidth || window.innerWidth;
    const height = viewer.clientHeight || window.innerHeight;
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(viewer);
  resize();

  controls.addEventListener('start', () => { controls.autoRotate = false; });
  controls.addEventListener('end', () => { window.setTimeout(() => { controls.autoRotate = true; }, 2500); });

  renderer.setAnimationLoop(() => {
    const deltaSeconds = Math.min(waveClock.getDelta(), 0.05);
    controls.update();
    updateModelActions(deltaSeconds);
    updateExplosion(deltaSeconds);
    updateRadarWaves(deltaSeconds);
    renderer.render(scene, camera);
  });
  setFocus('all');
}

setupModelExplorer();
