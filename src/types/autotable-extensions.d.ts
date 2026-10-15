import 'jspdf-autotable';
declare module 'jspdf-autotable' {
  interface CellDef {
    _isGroupStart?: boolean; _isMerged?: boolean; _isLastInGroup?: boolean;
    _restoredOnPage?: boolean; _originalContent?: string | number;
  }
  interface Cell { _rotatedText?: string; _isTriangle?: boolean; }
}
