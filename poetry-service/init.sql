-- =====================================================================
-- 诗词数据库初始化脚本 (init.sql)
-- 适用数据库: MySQL 5.7+ / 8.0+
-- 字符集规范: utf8mb4 (完美支持古汉语生僻字、繁体字)
-- =====================================================================

-- 1. 如果不存在则创建数据库（如果你已经在 Navicat/Workbench 中建好了，这一步会自动跳过）
CREATE DATABASE IF NOT EXISTS `poetry-app` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `poetry-app`;

-- SET NAMES 确保客户端连接、传输时不会因为编码问题导致乱码
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================================
-- 表 1: authors (作者表)
-- =====================================================================
DROP TABLE IF EXISTS `authors`;
CREATE TABLE `authors` (
  `id` INT AUTO_INCREMENT COMMENT '主键自增ID',
  `name` VARCHAR(100) NOT NULL COMMENT '作者姓名',
  `description` TEXT DEFAULT NULL COMMENT '详细生平描述',
  `short_description` TEXT DEFAULT NULL COMMENT '精简生平介绍',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_name` (`name`) USING BTREE COMMENT '作者姓名唯一索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='宋代词人信息表';


-- =====================================================================
-- 表 2: poems (全宋词表)
-- =====================================================================
DROP TABLE IF EXISTS `poems`;
CREATE TABLE `poems` (
  `id` INT AUTO_INCREMENT COMMENT '主键自增ID',
  `author` VARCHAR(100) DEFAULT NULL COMMENT '词人姓名',
  `rhythmic` VARCHAR(255) DEFAULT NULL COMMENT '词牌名 (如: 水调歌头)',
  `paragraphs` TEXT DEFAULT NULL COMMENT '拼合后的正文文本 (带换行)',
  `paragraphs_raw` TEXT DEFAULT NULL COMMENT '原始 JSON 数组备份 (保留项目结构)',
  PRIMARY KEY (`id`),
  KEY `idx_author` (`author`) USING BTREE COMMENT '作者查询索引',
  KEY `idx_rhythmic` (`rhythmic`) USING BTREE COMMENT '词牌名查询索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='全宋词海量数据表';


-- =====================================================================
-- 表 3: three_hundred_poems (宋词三百首精选表)
-- =====================================================================
DROP TABLE IF EXISTS `three_hundred_poems`;
CREATE TABLE `three_hundred_poems` (
  `id` INT AUTO_INCREMENT COMMENT '主键自增ID',
  `author` VARCHAR(100) DEFAULT NULL COMMENT '词人姓名',
  `rhythmic` VARCHAR(255) DEFAULT NULL COMMENT '词牌名 (如: 定风波)',
  `paragraphs` TEXT DEFAULT NULL COMMENT '拼合后的正文文本 (带换行)',
  PRIMARY KEY (`id`),
  KEY `idx_300_author` (`author`) USING BTREE COMMENT '精选集作者索引',
  KEY `idx_300_rhythmic` (`rhythmic`) USING BTREE COMMENT '精选集词牌索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='宋词三百首精选表';

-- =====================================================================
-- 表 4: users (用户表)
-- =====================================================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT COMMENT '主键自增ID',
  `email` VARCHAR(255) NOT NULL COMMENT '用户邮箱',
  `password_hash` VARCHAR(255) NOT NULL COMMENT 'bcrypt加密后的密码',
  `nickname` VARCHAR(100) DEFAULT '' COMMENT '用户昵称',
  `avatar_url` VARCHAR(500) DEFAULT '' COMMENT '头像URL',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_email` (`email`) USING BTREE COMMENT '邮箱唯一索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户信息表';

-- =====================================================================
-- 表 5: verification_codes (验证码表)
-- =====================================================================
CREATE TABLE IF NOT EXISTS `verification_codes` (
  `id` INT AUTO_INCREMENT COMMENT '主键自增ID',
  `email` VARCHAR(255) NOT NULL COMMENT '目标邮箱',
  `code` VARCHAR(10) NOT NULL COMMENT '6位验证码',
  `purpose` VARCHAR(20) NOT NULL COMMENT '用途: register/reset',
  `expires_at` DATETIME NOT NULL COMMENT '过期时间',
  `used` TINYINT(1) DEFAULT 0 COMMENT '是否已使用: 0-否, 1-是',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_email_purpose` (`email`, `purpose`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='验证码表';

-- =====================================================================
-- 表 6: favorites (收藏表)
-- =====================================================================
CREATE TABLE IF NOT EXISTS `favorites` (
  `id` INT AUTO_INCREMENT COMMENT '主键自增ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `poem_id` INT NOT NULL COMMENT '词作ID',
  `poem_source` VARCHAR(30) NOT NULL DEFAULT 'poems' COMMENT '来源表: poems/three_hundred_poems',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_poem_fav` (`user_id`, `poem_id`, `poem_source`) USING BTREE,
  KEY `idx_user_id` (`user_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户收藏表';

-- =====================================================================
-- 表 7: likes (点赞表)
-- =====================================================================
CREATE TABLE IF NOT EXISTS `likes` (
  `id` INT AUTO_INCREMENT COMMENT '主键自增ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `poem_id` INT NOT NULL COMMENT '词作ID',
  `poem_source` VARCHAR(30) NOT NULL DEFAULT 'poems' COMMENT '来源表: poems/three_hundred_poems',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_poem_like` (`user_id`, `poem_id`, `poem_source`) USING BTREE,
  KEY `idx_user_id` (`user_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户点赞表';

-- =====================================================================
-- 种子数据: authors (宋代词人)
-- =====================================================================
INSERT INTO `authors` (`name`, `description`, `short_description`) VALUES
('苏轼', '苏轼（1037年1月8日—1101年8月24日），字子瞻，号东坡居士，世称苏东坡。北宋文学家、书法家、美食家、画家。一生宦海沉浮，足迹遍布大半个中国。其诗题材广阔，清新豪健，善用夸张比喻，独具风格。', '北宋文学家，号东坡居士'),
('李清照', '李清照（1084年—约1155年），号易安居士，宋代杰出女词人，婉约词派代表，有"千古第一才女"之称。其词善用白描手法，自辟途径，语言清丽。', '宋代女词人，千古第一才女'),
('辛弃疾', '辛弃疾（1140年5月28日—1207年10月3日），原字坦夫，后改字幼安，号稼轩，南宋豪放派词人、将领。其词以豪放为主，风格沉雄豪迈又不乏细腻柔媚。', '南宋豪放派词人、将领'),
('柳永', '柳永（约984年—约1053年），原名三变，字景庄，后改名柳永，字耆卿，北宋著名词人，婉约派代表人物。其词多描绘城市风光和歌妓生活，尤长于抒写羁旅行役之情。', '北宋婉约派词人'),
('陆游', '陆游（1125年—1210年），字务观，号放翁，南宋文学家、史学家、爱国诗人。其诗语言平易晓畅、章法整饬谨严，以豪放雄浑为主。', '南宋爱国诗人'),
('晏殊', '晏殊（991年—1055年），字同叔，北宋著名文学家、政治家。其词擅长小令，词风承袭五代冯延巳，语言清丽，音韵和谐。', '北宋宰相、词人'),
('晏几道', '晏几道（约1038年—约1110年），字叔原，号小山，北宋著名词人。其词多感伤情调，语言清新流转，有《小山词》传世。', '北宋词人，晏殊之子'),
('欧阳修', '欧阳修（1007年—1072年），字永叔，号醉翁，北宋政治家、文学家、史学家。为"唐宋八大家"之一，词风清新婉丽。', '北宋文学家，唐宋八大家之一'),
('秦观', '秦观（1049年—1100年），字少游，又字太虚，号淮海居士，北宋文学家。其词多写男女情爱，文辞清丽婉转。', '北宋词人，苏门四学士之一'),
('周邦彦', '周邦彦（1056年—1121年），字美成，号清真居士，北宋著名词人。其词格律谨严，语言典雅，为婉约派集大成者。', '北宋词人，婉约派集大成者'),
('岳飞', '岳飞（1103年—1142年），字鹏举，南宋抗金名将、军事家、战略家、民族英雄。其词《满江红》慷慨激昂，为千古绝唱。', '南宋抗金名将、民族英雄'),
('范仲淹', '范仲淹（989年—1052年），字希文，北宋杰出的思想家、政治家、文学家。其词《渔家傲》开豪放词先河。', '北宋政治家、文学家'),
('张先', '张先（990年—1078年），字子野，北宋词人。善写慢词，与柳永齐名，有"张三中"、"张三影"之称。', '北宋词人，善写慢词'),
('贺铸', '贺铸（1052年—1125年），字方回，号庆湖遗老，北宋词人。其词风格多样，兼有豪放、婉约之长。', '北宋词人，风格多样'),
('姜夔', '姜夔（约1155年—约1221年），字尧章，号白石道人，南宋文学家、音乐家。其词格律严密，清空骚雅。', '南宋词人、音乐家');

-- =====================================================================
-- 种子数据: three_hundred_poems (宋词三百首精选)
-- =====================================================================
INSERT INTO `three_hundred_poems` (`author`, `rhythmic`, `paragraphs`) VALUES
('苏轼', '水调歌头', '明月几时有？把酒问青天。\n不知天上宫阙，今夕是何年。\n我欲乘风归去，又恐琼楼玉宇，\n高处不胜寒。\n起舞弄清影，何似在人间。\n\n转朱阁，低绮户，照无眠。\n不应有恨，何事长向别时圆？\n人有悲欢离合，月有阴晴圆缺，\n此事古难全。\n但愿人长久，千里共婵娟。'),
('苏轼', '念奴娇·赤壁怀古', '大江东去，浪淘尽，千古风流人物。\n故垒西边，人道是，三国周郎赤壁。\n乱石穿空，惊涛拍岸，卷起千堆雪。\n江山如画，一时多少豪杰。\n\n遥想公瑾当年，小乔初嫁了，雄姿英发。\n羽扇纶巾，谈笑间，樯橹灰飞烟灭。\n故国神游，多情应笑我，早生华发。\n人生如梦，一尊还酹江月。'),
('苏轼', '江城子·密州出猎', '老夫聊发少年狂，左牵黄，右擎苍，\n锦帽貂裘，千骑卷平冈。\n为报倾城随太守，亲射虎，看孙郎。\n\n酒酣胸胆尚开张。鬓微霜，又何妨！\n持节云中，何日遣冯唐？\n会挽雕弓如满月，西北望，射天狼。'),
('苏轼', '定风波', '莫听穿林打叶声，何妨吟啸且徐行。\n竹杖芒鞋轻胜马，谁怕？一蓑烟雨任平生。\n\n料峭春风吹酒醒，微冷，山头斜照却相迎。\n回首向来萧瑟处，归去，也无风雨也无晴。'),
('李清照', '声声慢', '寻寻觅觅，冷冷清清，凄凄惨惨戚戚。\n乍暖还寒时候，最难将息。\n三杯两盏淡酒，怎敌他、晚来风急！\n雁过也，正伤心，却是旧时相识。\n\n满地黄花堆积，憔悴损，如今有谁堪摘？\n守着窗儿，独自怎生得黑！\n梧桐更兼细雨，到黄昏、点点滴滴。\n这次第，怎一个愁字了得！'),
('李清照', '如梦令', '昨夜雨疏风骤，浓睡不消残酒。\n试问卷帘人，却道海棠依旧。\n知否，知否？应是绿肥红瘦。'),
('李清照', '醉花阴', '薄雾浓云愁永昼，瑞脑销金兽。\n佳节又重阳，玉枕纱厨，半夜凉初透。\n\n东篱把酒黄昏后，有暗香盈袖。\n莫道不销魂，帘卷西风，人比黄花瘦。'),
('辛弃疾', '破阵子·为陈同甫赋壮词以寄之', '醉里挑灯看剑，梦回吹角连营。\n八百里分麾下炙，五十弦翻塞外声，沙场秋点兵。\n\n马作的卢飞快，弓如霹雳弦惊。\n了却君王天下事，赢得生前身后名。可怜白发生！'),
('辛弃疾', '永遇乐·京口北固亭怀古', '千古江山，英雄无觅孙仲谋处。\n舞榭歌台，风流总被雨打风吹去。\n斜阳草树，寻常巷陌，人道寄奴曾住。\n想当年，金戈铁马，气吞万里如虎。\n\n元嘉草草，封狼居胥，赢得仓皇北顾。\n四十三年，望中犹记，烽火扬州路。\n可堪回首，佛狸祠下，一片神鸦社鼓。\n凭谁问，廉颇老矣，尚能饭否？'),
('辛弃疾', '青玉案·元夕', '东风夜放花千树。更吹落、星如雨。\n宝马雕车香满路。凤箫声动，玉壶光转，一夜鱼龙舞。\n\n蛾儿雪柳黄金缕。笑语盈盈暗香去。\n众里寻他千百度。蓦然回首，那人却在，灯火阑珊处。'),
('柳永', '雨霖铃', '寒蝉凄切，对长亭晚，骤雨初歇。\n都门帐饮无绪，留恋处，兰舟催发。\n执手相看泪眼，竟无语凝噎。\n念去去，千里烟波，暮霭沉沉楚天阔。\n\n多情自古伤离别，更那堪，冷落清秋节！\n今宵酒醒何处？杨柳岸，晓风残月。\n此去经年，应是良辰好景虚设。\n便纵有千种风情，更与何人说？'),
('柳永', '蝶恋花', '伫倚危楼风细细，望极春愁，黯黯生天际。\n草色烟光残照里，无言谁会凭阑意。\n\n拟把疏狂图一醉，对酒当歌，强乐还无味。\n衣带渐宽终不悔，为伊消得人憔悴。'),
('陆游', '钗头凤', '红酥手，黄縢酒，满城春色宫墙柳。\n东风恶，欢情薄。一怀愁绪，几年离索。\n错、错、错。\n\n春如旧，人空瘦，泪痕红浥鲛绡透。\n桃花落，闲池阁。山盟虽在，锦书难托。\n莫、莫、莫。'),
('晏殊', '浣溪沙', '一曲新词酒一杯，去年天气旧亭台。\n夕阳西下几时回？\n\n无可奈何花落去，似曾相识燕归来。\n小园香径独徘徊。'),
('晏几道', '临江仙', '梦后楼台高锁，酒醒帘幕低垂。\n去年春恨却来时。落花人独立，微雨燕双飞。\n\n记得小蘋初见，两重心字罗衣。\n琵琶弦上说相思。当时明月在，曾照彩云归。'),
('欧阳修', '生查子·元夕', '去年元夜时，花市灯如昼。\n月上柳梢头，人约黄昏后。\n\n今年元夜时，月与灯依旧。\n不见去年人，泪湿春衫袖。'),
('秦观', '鹊桥仙', '纤云弄巧，飞星传恨，银汉迢迢暗度。\n金风玉露一相逢，便胜却人间无数。\n\n柔情似水，佳期如梦，忍顾鹊桥归路。\n两情若是久长时，又岂在朝朝暮暮。'),
('周邦彦', '苏幕遮', '燎沉香，消溽暑。鸟雀呼晴，侵晓窥檐语。\n叶上初阳干宿雨，水面清圆，一一风荷举。\n\n故乡遥，何日去？家住吴门，久作长安旅。\n五月渔郎相忆否？小楫轻舟，梦入芙蓉浦。'),
('岳飞', '满江红', '怒发冲冠，凭栏处、潇潇雨歇。\n抬望眼、仰天长啸，壮怀激烈。\n三十功名尘与土，八千里路云和月。\n莫等闲、白了少年头，空悲切。\n\n靖康耻，犹未雪。臣子恨，何时灭。\n驾长车，踏破贺兰山缺。\n壮志饥餐胡虏肉，笑谈渴饮匈奴血。\n待从头、收拾旧山河，朝天阙。'),
('范仲淹', '渔家傲·秋思', '塞下秋来风景异，衡阳雁去无留意。\n四面边声连角起，千嶂里，长烟落日孤城闭。\n\n浊酒一杯家万里，燕然未勒归无计。\n羌管悠悠霜满地，人不寐，将军白发征夫泪。'),
('张先', '天仙子', '水调数声持酒听，午醉醒来愁未醒。\n送春春去几时回？临晚镜，伤流景，往事后期空记省。\n\n沙上并禽池上暝，云破月来花弄影。\n重重帘幕密遮灯，风不定，人初静，明日落红应满径。'),
('贺铸', '青玉案', '凌波不过横塘路，但目送、芳尘去。\n锦瑟华年谁与度？月桥花院，琐窗朱户，只有春知处。\n\n飞云冉冉蘅皋暮，彩笔新题断肠句。\n试问闲情都几许？一川烟草，满城风絮，梅子黄时雨。'),
('姜夔', '扬州慢', '淮左名都，竹西佳处，解鞍少驻初程。\n过春风十里，尽荠麦青青。\n自胡马窥江去后，废池乔木，犹厌言兵。\n渐黄昏，清角吹寒，都在空城。\n\n杜郎俊赏，算而今重到须惊。\n纵豆蔻词工，青楼梦好，难赋深情。\n二十四桥仍在，波心荡、冷月无声。\n念桥边红药，年年知为谁生？');

-- =====================================================================
-- 表 8: browse_history (浏览历史表)
-- =====================================================================
CREATE TABLE IF NOT EXISTS `browse_history` (
  `id` INT AUTO_INCREMENT COMMENT '主键自增ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `poem_id` INT NOT NULL COMMENT '词作ID',
  `poem_source` VARCHAR(30) NOT NULL DEFAULT 'poems' COMMENT '来源表: poems/three_hundred_poems',
  `viewed_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '浏览时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`) USING BTREE,
  KEY `idx_viewed_at` (`viewed_at`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='浏览历史表';

SET FOREIGN_KEY_CHECKS = 1;