-- Fix the function search path issue
CREATE OR REPLACE FUNCTION public.generate_sale_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(sale_number FROM 5) AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.sales
  WHERE sale_number LIKE 'SAL-%';
  
  RETURN 'SAL-' || LPAD(next_num::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;