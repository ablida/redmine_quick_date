require_relative './lib/quick_date_hooks'

Redmine::Plugin.register :redmine_quick_date do
  name 'Quick Date plugin'
  author 'ablida'
  description 'Adds a small hoverable icon next to the due date and start date fields on the issue form, opening a quick-pick menu (Today, Tomorrow, In 2 days, Next week, In 7/14/30 days).'
  version '0.0.1'
  url 'https://github.com/ablida/redmine_quick_date'
  author_url 'https://github.com/ablida'
end
