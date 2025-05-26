import { supabase } from './supabase';

export async function getSectionsWithElements(topicId: number) {
  const { data, error } = await supabase
    .from('sections')
    .select(`
      section_pk,
      title,
      section_type_xml,
      content_elements (
        element_pk,
        element_type,
        title_attribute,
        text_content,
        attribute_level,
        attribute_type,
        list_items (
          list_item_pk,
          item_text,
          order_in_list
        )
      )
    `)
    .eq('topic_fk', topicId)
    .order('order_in_topic', { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}
