import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, APIError } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { category, count = 5 } = await request.json();

    if (!category) {
      return NextResponse.json(
        { error: '请输入类别' },
        { status: 400 }
      );
    }

    let tags = [];
    let usedAI = false;
    let aiError = null;

    // 尝试使用 AI 生成
    try {
      const config = new Config();
      const client = new LLMClient(config);

      // 设计提示词，让AI生成品牌/标签列表
      const systemPrompt = `你是一个专业的标签生成助手。你的任务是根据用户提供的类别，生成真实、准确、知名的品牌或项目名称列表。

要求：
1. 只生成真实的品牌、产品、公司或项目名称
2. 不要生成广告内容、推广信息或虚假内容
3. 品牌名称要准确、真实、知名度高
4. 返回格式必须是有效的JSON数组，每个元素包含：
   - name: 品牌名称（字符串）
   - type: 标签类型（text、image或mixed，默认text）
5. 数量要准确匹配用户要求
6. 不要添加任何额外的文字说明，只返回JSON数组`;

      const userPrompt = `请为"${category}"这个类别生成${count}个知名品牌或项目名称的JSON列表。只返回JSON数组，不要其他内容。`;

      const messages = [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: userPrompt },
      ];

      const response = await client.invoke(messages, {
        temperature: 0.7,
      });

      // 解析AI返回的JSON
      let parsedData: any;
      try {
        // 尝试直接解析
        parsedData = JSON.parse(response.content);
      } catch (e) {
        // 如果失败，尝试提取JSON部分
        const jsonMatch = response.content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('无法解析AI返回的数据');
        }
      }

      // 转换为标签格式
      const items = Array.isArray(parsedData) ? parsedData : [];

      for (let i = 0; i < Math.min(count, items.length); i++) {
        const item = items[i];
        const name = item.name || item.brand || item.content || String(item);

        tags.push({
          id: `ai-${Date.now()}-${i}`,
          type: 'text',
          content: name.trim(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }

      if (tags.length > 0) {
        usedAI = true;
      }
    } catch (aiErrorCatch) {
      // AI 调用失败，记录错误，使用备用方案
      aiError = aiErrorCatch;
      console.error('AI生成标签失败，使用备用方案:', aiErrorCatch);

      // 如果是 APIError，记录详细信息
      if (aiErrorCatch instanceof APIError) {
        console.error('API Error Details:', {
          message: aiErrorCatch.message,
          statusCode: aiErrorCatch.statusCode,
        });
      }
    }

    // 如果AI失败或返回的内容不足，使用备用逻辑
    if (tags.length < count) {
      const backupTags = generateBackupTags(category, count - tags.length);
      tags.push(...backupTags);
    }

    return NextResponse.json({
      success: true,
      tags,
      summary: usedAI
        ? `已为您生成${tags.length}个${category}相关的标签`
        : `已为您生成${tags.length}个${category}相关的标签（使用预设列表）`,
      usedAI,
      aiError: aiError ? String(aiError) : null,
    });
  } catch (error) {
    console.error('生成标签失败:', error);
    return NextResponse.json(
      {
        error: '生成标签失败，请稍后重试',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// 备用标签生成逻辑（当AI失败时）
function generateBackupTags(category: string, count: number) {
  const backupTags = [];
  const categoryLower = category.toLowerCase();

  // 扩展的类别匹配关键词
  const categoryKeywords = {
    '奶茶饮品咖啡': ['奶茶', '饮品', '咖啡', 'tea', 'coffee', 'drink', 'beverage'],
    '餐厅美食火锅': ['餐厅', '美食', '火锅', 'restaurant', 'food', 'dining'],
    '游戏': ['游戏', 'game', '游戏'],
    '手机数码': ['手机', '数码', 'phone', 'mobile', 'digital'],
    '电商平台': ['电商', '购物', '购物平台', 'ecommerce', 'shop', 'shopping'],
    '社交软件': ['社交', '聊天', 'social', 'chat', 'message'],
    '视频平台': ['视频', '影视', 'video', 'movie', 'film'],
    '音乐平台': ['音乐', 'music', 'music'],
    '办公软件': ['办公', 'office', 'work'],
    '出行工具': ['出行', '打车', '出行', 'travel', 'taxi'],
  };

  // 查找匹配的类别
  let matchedCategory: string | null = null;
  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(kw => categoryLower.includes(kw))) {
      matchedCategory = cat;
      break;
    }
  }

  // 根据类别生成标签
  if (matchedCategory === '奶茶饮品咖啡') {
    const brands = ['蜜雪冰城', '瑞幸咖啡', '星巴克', '喜茶', '奈雪的茶', '一点点', 'CoCo都可', '茶百道', '沪上阿姨', '霸王茶姬'];
    for (let i = 0; i < Math.min(count, brands.length); i++) {
      backupTags.push({
        id: `backup-${Date.now()}-${i}`,
        type: 'text',
        content: brands[i],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  } else if (matchedCategory === '餐厅美食火锅') {
    const brands = ['海底捞', '麦当劳', '肯德基', '必胜客', '外婆家', '西贝', '太二酸菜鱼', '呷哺呷哺', '真功夫', '全聚德'];
    for (let i = 0; i < Math.min(count, brands.length); i++) {
      backupTags.push({
        id: `backup-${Date.now()}-${i}`,
        type: 'text',
        content: brands[i],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  } else if (matchedCategory === '游戏') {
    const brands = ['王者荣耀', '原神', '和平精英', '英雄联盟', '绝地求生', '穿越火线', '梦幻西游', '地下城与勇士', '阴阳师', '使命召唤'];
    for (let i = 0; i < Math.min(count, brands.length); i++) {
      backupTags.push({
        id: `backup-${Date.now()}-${i}`,
        type: 'text',
        content: brands[i],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  } else if (matchedCategory === '手机数码') {
    const brands = ['华为', '小米', '苹果', 'OPPO', 'vivo', '三星', '一加', 'realme', '荣耀', '中兴'];
    for (let i = 0; i < Math.min(count, brands.length); i++) {
      backupTags.push({
        id: `backup-${Date.now()}-${i}`,
        type: 'text',
        content: brands[i],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  } else if (matchedCategory === '电商平台') {
    const brands = ['淘宝', '京东', '拼多多', '天猫', '苏宁易购', '唯品会', '得物', '小红书', '闲鱼', '美团'];
    for (let i = 0; i < Math.min(count, brands.length); i++) {
      backupTags.push({
        id: `backup-${Date.now()}-${i}`,
        type: 'text',
        content: brands[i],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  } else if (matchedCategory === '社交软件') {
    const brands = ['微信', 'QQ', '微博', '抖音', '快手', '小红书', '知乎', '豆瓣', 'B站', '陌陌'];
    for (let i = 0; i < Math.min(count, brands.length); i++) {
      backupTags.push({
        id: `backup-${Date.now()}-${i}`,
        type: 'text',
        content: brands[i],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  } else if (matchedCategory === '视频平台') {
    const brands = ['Netflix', '爱奇艺', '腾讯视频', '优酷', 'B站', '抖音', '快手', 'YouTube', '芒果TV', '咪咕视频'];
    for (let i = 0; i < Math.min(count, brands.length); i++) {
      backupTags.push({
        id: `backup-${Date.now()}-${i}`,
        type: 'text',
        content: brands[i],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  } else if (matchedCategory === '音乐平台') {
    const brands = ['网易云音乐', 'QQ音乐', '酷狗音乐', '酷我音乐', 'Spotify', 'Apple Music', '虾米音乐', '咪咕音乐', '千千音乐', 'YouTube Music'];
    for (let i = 0; i < Math.min(count, brands.length); i++) {
      backupTags.push({
        id: `backup-${Date.now()}-${i}`,
        type: 'text',
        content: brands[i],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  } else if (matchedCategory === '办公软件') {
    const brands = ['Microsoft Office', 'Google Docs', 'WPS', 'Notion', '飞书', '钉钉', '石墨文档', '腾讯文档', '金山文档', '有道云笔记'];
    for (let i = 0; i < Math.min(count, brands.length); i++) {
      backupTags.push({
        id: `backup-${Date.now()}-${i}`,
        type: 'text',
        content: brands[i],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  } else if (matchedCategory === '出行工具') {
    const brands = ['滴滴出行', '高德打车', '曹操出行', '美团打车', '首汽约车', '神州专车', '嘀嗒出行', '哈啰出行', 'T3出行', '花小猪'];
    for (let i = 0; i < Math.min(count, brands.length); i++) {
      backupTags.push({
        id: `backup-${Date.now()}-${i}`,
        type: 'text',
        content: brands[i],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  } else {
    // 通用备用标签
    for (let i = 0; i < count; i++) {
      backupTags.push({
        id: `backup-${Date.now()}-${i}`,
        type: 'text',
        content: `${category}-${i + 1}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  }

  return backupTags;
}
