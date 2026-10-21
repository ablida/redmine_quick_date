class QuickDateHooks < Redmine::Hook::ViewListener
  render_on :view_layouts_base_html_head, partial: 'hooks/quick_date_head'
end
