import { createSlug } from './slug';

// Note: createUniqueSlug requires database access and is tested in integration tests

describe('Slug Utils', () => {
  describe('createSlug', () => {
    it('should convert text to lowercase', () => {
      const result = createSlug('Hello World');

      expect(result).toBe('hello-world');
    });

    it('should replace spaces with hyphens', () => {
      const result = createSlug('my store name');

      expect(result).toBe('my-store-name');
    });

    it('should remove special characters', () => {
      const result = createSlug('My Store! @#$%');

      // Slugify with strict mode converts special chars
      expect(result).toContain('my-store');
    });

    it('should handle multiple spaces', () => {
      const result = createSlug('my    store    name');

      expect(result).toBe('my-store-name');
    });

    it('should trim leading and trailing spaces', () => {
      const result = createSlug('  my store  ');

      expect(result).toBe('my-store');
    });

    it('should handle accented characters', () => {
      const result = createSlug('Café Panadería');

      expect(result).toBe('cafe-panaderia');
    });

    it('should handle numbers', () => {
      const result = createSlug('Store 123');

      expect(result).toBe('store-123');
    });

    it('should handle already lowercase text', () => {
      const result = createSlug('my-store');

      expect(result).toBe('my-store');
    });

    it('should handle single word', () => {
      const result = createSlug('Store');

      expect(result).toBe('store');
    });

    it('should handle ampersand', () => {
      const result = createSlug('Coffee & Tea');

      expect(result).toBe('coffee-and-tea');
    });

    it('should handle underscores', () => {
      const result = createSlug('my_store_name');

      // Slugify with strict mode removes underscores
      expect(result).toBe('mystorename');
    });

    it('should handle empty string', () => {
      const result = createSlug('');

      expect(result).toBe('');
    });

    it('should handle only special characters', () => {
      const result = createSlug('!@#$%^&*()');

      // Slugify converts & to 'and' and may include other chars
      expect(result).toContain('and');
    });

    it('should handle mixed case with numbers', () => {
      const result = createSlug('Store2Go 24/7');

      // With strict mode, slashes are removed
      expect(result).toBe('store2go-247');
    });

    it('should handle unicode characters', () => {
      const result = createSlug('日本語');

      // Slugify typically removes non-latin characters
      expect(result).toBe('');
    });

    it('should handle long strings', () => {
      const longName = 'This is a very long store name that should still be converted properly';
      const result = createSlug(longName);

      expect(result).toBe('this-is-a-very-long-store-name-that-should-still-be-converted-properly');
    });
  });
});
