import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Plus, Edit2, Trash2, Target, Clock, Dumbbell, Sparkles } from 'lucide-react-native';
import NeuButton from '@/components/core-components/NeuButton';
import { darkenColor } from '@/src/utils';

interface TemplatesTabProps {
  styles: any;
  theme: any;
  accentColor: string;
  templates: any[];
  loading: boolean;
  onTemplatePress: (template: any) => void;
  onCreateTemplate: () => void;
  onEditTemplate: (template: any) => void;
  onDeleteTemplate: (templateId: string) => void;
}

export default function TemplatesTab({
  styles,
  theme,
  accentColor,
  templates,
  loading,
  onTemplatePress,
  onCreateTemplate,
  onEditTemplate,
  onDeleteTemplate,
}: TemplatesTabProps) {
  return (
    <View style={styles.section}>
      {/* Create Template Button */}
      <NeuButton
        title="Create New Template"
        onPress={onCreateTemplate}
        backgroundColor={accentColor}
        shadowColor={darkenColor(accentColor, 10)}
        leftIcon={<Plus size={22} color="#fff" />}
        style={styles.primaryButton}
      />

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={accentColor} />
        </View>
      ) : templates.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconContainer, { backgroundColor: `${accentColor}15` }]}>
            <Target size={48} color={accentColor} />
          </View>
          <Text style={[styles.emptyText, { color: theme.textPrimary }]}>No Templates Yet</Text>
          <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
            Create your first workout template to get started with structured training
          </Text>
        </View>
      ) : (
        <View style={styles.templatesGrid}>
          {templates.map((template: any) => (
            <TouchableOpacity
              key={template.id}
              style={[styles.templateCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
              onPress={() => onTemplatePress(template)}
              activeOpacity={0.8}
            >
              {/* Main Card Content - Horizontal Layout */}
              <View style={styles.templateCardMainContent}>
                {/* Icon Container */}
                <View style={[styles.templateIconContainer, { backgroundColor: `${accentColor}15` }]}>
                  <Target size={28} color={accentColor} />
                </View>

                {/* Content Section */}
                <View style={styles.templateCardContent}>
                  <View style={styles.templateCardHeader}>
                    <Text style={[styles.templateName, { color: theme.textPrimary }]} numberOfLines={1}>
                      {template.name}
                    </Text>
                    {template.isSystemTemplate && (
                      <View style={[styles.systemBadge, { backgroundColor: accentColor }]}>
                        <Sparkles size={10} color="#fff" />
                        <Text style={styles.systemBadgeText}>System</Text>
                      </View>
                    )}
                  </View>
                  
                  {template.description && (
                    <Text style={[styles.templateDescription, { color: theme.textSecondary }]} numberOfLines={2}>
                      {template.description}
                    </Text>
                  )}

                  {/* Stats Row */}
                  <View style={styles.templateStats}>
                    <View style={styles.templateStatItem}>
                      <Clock size={16} color={theme.textSecondary} />
                      <Text style={[styles.templateStatText, { color: theme.textSecondary }]}>
                        {template.estimatedDurationMinutes || 0}m
                      </Text>
                    </View>
                    <View style={styles.templateStatItem}>
                      <Dumbbell size={16} color={theme.textSecondary} />
                      <Text style={[styles.templateStatText, { color: theme.textSecondary }]}>
                        {template.exercises?.length || 0} exercises
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              
              {/* Action Buttons */}
              {!template.isSystemTemplate && (
                <View style={[styles.templateActions, { borderTopColor: theme.border }]}>
                  <TouchableOpacity
                    style={[styles.templateActionButton, { backgroundColor: `${accentColor}15`, borderColor: accentColor }]}
                    onPress={() => onEditTemplate(template)}
                    activeOpacity={0.7}
                  >
                    <Edit2 size={18} color={accentColor} />
                    <Text style={[styles.templateActionText, { color: accentColor }]}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.templateActionButton, { backgroundColor: '#ef444415', borderColor: '#ef4444' }]}
                    onPress={() => onDeleteTemplate(template.id)}
                    activeOpacity={0.7}
                  >
                    <Trash2 size={18} color="#ef4444" />
                    <Text style={[styles.templateActionText, { color: '#ef4444' }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
