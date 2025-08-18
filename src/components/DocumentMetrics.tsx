/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { 
  FileText, 
  Clock, 
  Hash, 
  AlignLeft, 
  Eye, 
  BarChart3,
  TrendingUp
} from 'lucide-react';

interface DocumentMetricsProps {
  content: string;
  isVisible?: boolean;
  compact?: boolean;
  showTrends?: boolean;
}

interface Metrics {
  wordCount: number;
  characterCount: number;
  lineCount: number;
  paragraphCount: number;
  headingCount: number;
  linkCount: number;
  imageCount: number;
  readingTime: number;
  complexity: 'Simple' | 'Moderate' | 'Complex';
}

export function DocumentMetrics({ 
  content, 
  isVisible = true, 
  compact = false,
  showTrends = false 
}: DocumentMetricsProps) {
  const [metrics, setMetrics] = useState<Metrics>({
    wordCount: 0,
    characterCount: 0,
    lineCount: 0,
    paragraphCount: 0,
    headingCount: 0,
    linkCount: 0,
    imageCount: 0,
    readingTime: 0,
    complexity: 'Simple'
  });
  
  const [previousMetrics, setPreviousMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    const calculateMetrics = (): Metrics => {
      if (!content.trim()) {
        return {
          wordCount: 0,
          characterCount: 0,
          lineCount: 0,
          paragraphCount: 0,
          headingCount: 0,
          linkCount: 0,
          imageCount: 0,
          readingTime: 0,
          complexity: 'Simple'
        };
      }

      // Basic counts
      const characterCount = content.length;
      const characterCountNoSpaces = content.replace(/\s/g, '').length;
      const wordCount = content.trim().split(/\s+/).length;
      const lineCount = content.split('\n').length;
      
      // Paragraph count (empty lines separate paragraphs)
      const paragraphCount = content.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
      
      // Markdown-specific counts
      const headingCount = (content.match(/^#{1,6}\s/gm) || []).length;
      const linkCount = (content.match(/\[.*?\]\(.*?\)/g) || []).length;
      const imageCount = (content.match(/!\[.*?\]\(.*?\)/g) || []).length;
      
      // Reading time (average 200 words per minute)
      const readingTime = Math.ceil(wordCount / 200);
      
      // Complexity based on various factors
      const avgWordsPerSentence = wordCount / Math.max(1, (content.match(/[.!?]+/g) || []).length);
      const avgSentencesPerParagraph = (content.match(/[.!?]+/g) || []).length / Math.max(1, paragraphCount);
      const structuralComplexity = headingCount + linkCount + imageCount;
      
      let complexity: 'Simple' | 'Moderate' | 'Complex' = 'Simple';
      if (avgWordsPerSentence > 20 || avgSentencesPerParagraph > 8 || structuralComplexity > 20) {
        complexity = 'Complex';
      } else if (avgWordsPerSentence > 15 || avgSentencesPerParagraph > 5 || structuralComplexity > 10) {
        complexity = 'Moderate';
      }

      return {
        wordCount,
        characterCount,
        lineCount,
        paragraphCount,
        headingCount,
        linkCount,
        imageCount,
        readingTime,
        complexity
      };
    };

    const newMetrics = calculateMetrics();
    
    // Store previous metrics for trend analysis
    if (showTrends && metrics.wordCount !== newMetrics.wordCount) {
      setPreviousMetrics(metrics);
    }
    
    setMetrics(newMetrics);
  }, [content, showTrends]);

  const getTrend = (current: number, previous: number): 'up' | 'down' | 'same' => {
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return 'same';
  };

  const getTrendColor = (trend: 'up' | 'down' | 'same'): string => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const getComplexityColor = (complexity: string): string => {
    switch (complexity) {
      case 'Simple': return 'text-green-600 bg-green-50 dark:bg-green-950';
      case 'Moderate': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950';
      case 'Complex': return 'text-red-600 bg-red-50 dark:bg-red-950';
      default: return 'text-muted-foreground';
    }
  };

  if (!isVisible || (!content.trim() && compact)) return null;

  if (compact) {
    return (
      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
        <div className="flex items-center space-x-1">
          <AlignLeft className="h-3 w-3" />
          <span>{metrics.wordCount} words</span>
        </div>
        <div className="flex items-center space-x-1">
          <Clock className="h-3 w-3" />
          <span>{metrics.readingTime} min read</span>
        </div>
        <div className="flex items-center space-x-1">
          <Hash className="h-3 w-3" />
          <span>{metrics.headingCount} headings</span>
        </div>
        <Badge variant="outline" className={`text-xs ${getComplexityColor(metrics.complexity)}`}>
          {metrics.complexity}
        </Badge>
      </div>
    );
  }

  const metricCards = [
    {
      label: 'Words',
      value: metrics.wordCount,
      icon: <AlignLeft className="h-4 w-4" />,
      trend: previousMetrics ? getTrend(metrics.wordCount, previousMetrics.wordCount) : 'same'
    },
    {
      label: 'Characters',
      value: metrics.characterCount,
      icon: <FileText className="h-4 w-4" />,
      trend: previousMetrics ? getTrend(metrics.characterCount, previousMetrics.characterCount) : 'same'
    },
    {
      label: 'Reading Time',
      value: `${metrics.readingTime} min`,
      icon: <Clock className="h-4 w-4" />,
      trend: previousMetrics ? getTrend(metrics.readingTime, previousMetrics.readingTime) : 'same'
    },
    {
      label: 'Headings',
      value: metrics.headingCount,
      icon: <Hash className="h-4 w-4" />,
      trend: previousMetrics ? getTrend(metrics.headingCount, previousMetrics.headingCount) : 'same'
    },
    {
      label: 'Paragraphs',
      value: metrics.paragraphCount,
      icon: <AlignLeft className="h-4 w-4" />,
      trend: previousMetrics ? getTrend(metrics.paragraphCount, previousMetrics.paragraphCount) : 'same'
    },
    {
      label: 'Links',
      value: metrics.linkCount,
      icon: <Eye className="h-4 w-4" />,
      trend: previousMetrics ? getTrend(metrics.linkCount, previousMetrics.linkCount) : 'same'
    }
  ];

  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-medium">Document Metrics</h3>
          </div>
          <Badge 
            variant="outline" 
            className={`text-xs ${getComplexityColor(metrics.complexity)} border-current`}
          >
            {metrics.complexity}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {metricCards.map((metric, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/30"
            >
              <div className="flex items-center space-x-2">
                <div className="text-muted-foreground">
                  {metric.icon}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                  <p className="text-sm font-medium">{metric.value}</p>
                </div>
              </div>
              
              {showTrends && previousMetrics && metric.trend !== 'same' && (
                <div className={`text-xs ${getTrendColor(metric.trend)}`}>
                  <TrendingUp 
                    className={`h-3 w-3 ${metric.trend === 'down' ? 'rotate-180' : ''}`} 
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        
        {content.trim() && (
          <div className="mt-3 pt-3 border-t border-border/30 text-xs text-muted-foreground">
            <div className="flex justify-between items-center">
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
              <span>{metrics.lineCount} lines</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}